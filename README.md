# Cuneur Template

This repository is a template repository for the usage of the Cuneur - Cuneiform Annotator application.

## Local photo workflow (first internship milestone)

From this repository directory in PowerShell, run:

```powershell
bundle.bat exec jekyll serve --config "_config.yml,_config.local.yml"
```

The local config must contain `baseurl: ""`. Open <http://127.0.0.1:4000/annotator.html>.
The page starts with the original two-column Cuneur interface: tablet catalog
and 2D editor on the left, and 3D/Transliteration/Translation tabs on the right.
Local tools are optional, under the collapsed **Local image upload and annotation
import** section. Using a local photo requires no GitLab credentials, OCR service,
or server-side photo storage. The catalog still makes its existing remote requests,
and browser libraries still load from the template's CDNs, so this is not a fully
offline application.

1. Expand **Local image upload and annotation import**, then choose a PNG or
   JPEG under **Tablet photo**. The file stays in the browser.
   The displayed dimensions are the original image dimensions. Files must be
   nonempty, at most 25 MiB, and at most 50 million pixels.
2. Choose the rectangle tool and drag a sign box. Enter its **Transliteration**
   and click **OK**. Click an existing box to edit its label or drag its resize
   handles, then click **OK** again. If dragging pans the image, select the
   rectangle tool first (Shift + drag also invokes Annotorious drawing).
3. Click **Export Annotations** after saving the popup. Keep the downloaded
   `PHOTO.annotations.json` and the unchanged original photo together.
4. To resume in another session, upload that same photo, then select the JSON
   under **Import annotations**. Import replaces the displayed annotations;
   you will be asked before replacing an existing nonempty set.

New JSON exports have this shape:

```json
{
  "format": "cuneur-local-annotations",
  "version": 1,
  "image": {
    "name": "tablet.png",
    "width": 2400,
    "height": 1800,
    "sha256": "<64-character SHA-256 fingerprint of the original file>"
  },
  "annotations": {
    "<annotation ID>": "<complete Web Annotation object>"
  }
}
```

The `annotations` object retains the existing ID-keyed structure, and each
annotation retains its `body` array and rectangular `FragmentSelector` with
`xywh=pixel:x,y,width,height`. Coordinates are copied from Annotorious in
original-image pixels; zooming, rotation, and screen size do not rescale the
export. Image targets use a stable `urn:sha256:` source in saved JSON, rather
than a temporary browser `blob:` URL. On import they are rebound to the current
photo's browser URL without changing the boxes or labels.

The fingerprint prevents new-format JSON from being applied to a different
photo, including a resized or recompressed copy. Renaming an unchanged file is
fine. The photo itself is not embedded. Old ID-keyed exports and annotation
arrays can also be imported if their bodies and rectangular pixel selectors
are valid. They have no image fingerprint, so the editor displays a reminder
to check their alignment. Percentage selectors, polygons, malformed bodies,
duplicate IDs, and boxes outside the image are rejected with a message.
Invalid files leave the current photo and annotations intact.

Photo replacement is transactional: the new viewer opens in temporary offscreen
elements while the current catalog or local viewer stays alive. Only a successful
open swaps the editor and retires the previous viewer. If opening fails or reaches
the 20-second viewer timeout, the previous image, annotations, mode, and toolbar
remain intact. The failed candidate's event handlers, timer, DOM elements, viewer,
and blob URL are cleaned up; a queued late event cannot change the retained session.

Uploading a photo changes only the left image editor; it does not hide either
column or the existing metadata and tabs. The 3D viewer continues to show its
catalog model, not a reconstruction of the uploaded photo. The tablet and side
selectors are temporarily disabled while a local photo is active, because that
photo has no catalog side sequence. Export your work, then choose **Return to
tablet catalog** in the expanded local section to reload the original default
page and re-enable catalog navigation. Existing tablet-ID links also start in
catalog mode. Refreshing, returning, or closing clears local in-memory work.

Catalog repository saves (including **Save 3D Annotation in Gitlab**, approvals,
and transliteration saves) are disabled while a photo is loading or local mode is
active. The save functions also check this state before repository writes, so
calling them directly cannot store local annotations under a catalog filename.
Retry writes use a captured catalog payload and recheck the guard after a failed
request. Local JSON export stays available. Failed uploads restore previous save
control states; returning to the catalog reloads its normal controls. Layouts
without the local-photo module keep their original catalog saving behavior.

Normal 3D initialization still runs at startup, independently of local controls.
Its annotation-surface requests run asynchronously, so a slow or failed 3D
request cannot block local photo editing. 3D initialization/model errors are
reported to the browser console and do not disable upload, import, or export.

### How the code connects

- `_layouts/default.html` retains catalog startup and the original columns, with
  local controls inside a closed `<details>` element. `_pages/annotator.md`
  generates `/annotator.html` with this layout.
- `js/localannotations.js` validates/decodes photos, creates their temporary
  browser URLs, and attaches the existing OpenSeadragon/Annotorious editor.
  Create, update, and delete events keep `curanno` synchronized. Export reads
  the editor's current saved annotations directly. `localMode` starts false and
  becomes true only after the candidate viewer has opened, when the prepared
  editor is activated. Candidate callbacks use their own viewer/annotation
  instances rather than the shared globals. While preparation is pending, the
  original catalog editor remains current; its callbacks can still update it.
  Catalog JSON/authentication callbacks, page events, and late `window.onload`
  check this flag before changing the shared viewer or annotation state. The
  flag stays true until the page reloads, so old catalog callbacks cannot resume
  writing into a local session.
- `js/localannotationformat.js` validates imports and builds the versioned
  export. It does not use the DOM, so its data behavior can be tested directly.
- `js/annotatorfunctions.js` supplies the existing `TextMapWidget` form;
  `js/conf/mappingtemplates.js` defines its Transliteration field. The widget
  now listens for `input` events so pasting text also updates labels.
- `js/lib/saveTextAsFile.js` performs the existing download. Local exports
  pass `.json` with the dot so the downloaded filename has a proper extension.
- `js/conf/annotatorconf.js` guards catalog repository save entry points and
  their fallback writes. The guard allows normal saves when the optional local
  module is absent.

### Checks and browser checklist

Build with `bundle.bat exec jekyll build --config "_config.yml,_config.local.yml"`.
If Node.js is available, run `node _tests/localannotations.test.cjs` (no npm
packages are needed). These tests cover data round trips and file/event handling
using simulated browser/editor adapters, including executing the actual catalog
startup scripts. They cover delayed catalog callbacks both during and after
local image opening, normal catalog/3D startup, pending/failed 3D requests,
navigation locks, and all annotation round trips. They do not replace visual
browser QA.
Failure and timeout tests retain real session references within those simulated
adapters, fire obsolete callbacks after cleanup, and count repository write calls.
No real repository writes are made by the tests.

- Open `/annotator.html` with no query string. Confirm the original two columns,
  catalog selectors, metadata, and right-side tabs are visible; local tools
  should be collapsed. Change tablet/side and check the 2D image and 3D controls.
- Expand local tools. Upload a PNG, draw two boxes, label them, and click OK.
  Repeat with a JPEG. Confirm both columns remain and catalog selectors disable.
- Edit a label by pasting text; resize and move a box; save each change.
- Zoom or rotate, export, reload, upload the identical photo, and import the
  JSON. Check both labels and boxes. Export again and compare the selector
  values and bodies. Delete one box, save, and confirm it disappears from export.
- Try malformed JSON, a renamed text file with a `.png` extension, and JSON
  for another photo. Confirm clear errors and that existing work stays intact.
- Re-upload the same photo or import the same JSON twice. Confirm replacement
  does not duplicate boxes; cancel replacement and check that work remains.
- With slow network throttling, upload while catalog/3D requests are still
  pending. Confirm late responses do not replace the photo or labels. With a
  failed/blocked 3D model request, repeat local upload and export/import.
- Export, then use **Return to tablet catalog**. Confirm normal startup and
  catalog/side navigation are restored.
- Force a failed/stalled candidate image open in DevTools, once from catalog
  mode and once when replacing a local photo. Confirm the previous image,
  edited labels/boxes, and controls survive the error or 20-second viewer timeout.
- In local mode, confirm catalog GitLab saves are disabled and direct save
  function calls show a message without a repository write request in Network.
  Use the simulated regression tests to verify successful catalog writes without
  writing real data during manual checks.

### Next milestone: real OCR

No OCR predictions are generated here. Connecting real OCR requires the model
or API contract (image input, sign labels, confidence, and box coordinate
convention), a conversion into this editor's original-pixel Web Annotations,
and a way to distinguish predictions from user corrections. TokenWorks website
integration requires that repository and its upload, storage, and authentication
design. No endpoint or GitLab credentials have been added for this milestone.

This README aims to guide the user to get started with annotating a new set of images of cuneiform tablet contents.

Please also consult the [Wiki](https://gitlab.com/fcgl/cuneur-template/-/wikis/home) for more detailed information.

## Image preparation

Cuneur expects a set of images to represent cuneiform tablet contents to be accessible.

Usually, cuneiform tablets will be reprsented by the following types of images:

- FatCross Images of cuneiform tablets like the ones present in the [Cuneiform Digital Library Initiative](https://cdli.mpiwg-berlin.mpg.de/artifacts/123456) 
- Photos of specific views on cuneiform tablet surfaces
- Calculated renderings of cuneiform tablet surfaces such as the [HeiCuBeDa dataset](https://heidata.uni-heidelberg.de/dataset.xhtml?persistentId=doi:10.11588/data/IE8CCN&version=1.1)

Photos and renderings are directly supported in the Cuneur application. 

FatCross images need to be broken down into images of the individual surfaces to be used in the Cuneur application.

We recommend to store images in an image format that allows for transparency, such as PNG. Other compatible formats are:
- JPEG
- TIFF
- Other image formats which can be resolved in your web browser

### Hosting prepared images for Cuneur

While it is possible to host images in the Gitlab repository that Cuneur provides, we do not recommend this for the following reasons:
1. Images should be hosted using an appropriate service such as [IIIF](https://iiif.io) at best at a service which can guarantee long-term accessibility. This also allows for the citation and reusage of single image resources
2. The performance of loading images using the Gitlab.com API from a single repository is usually less optimal as compared to an external hosting service specialized for these purposes
3. Specialized images services like IIIF allow for more options in exporting annotations. IIIF for example allows the citation and export of IIIF annotations using IIIF links which describe the annotation itself

### Integration of hosted rendering images into Cuneur

Once rendering images have been selected and hosted for the annotation with Cuneur, the rednering images have to be linked in the Cuneur application. 

To do that they have to be added to the file js/data/renderings.js

`
var renderingurls={
"HS_1004": {
  "label": "HS_1004",
  "variants": [
      {
        "label": "HS_1004_01_top.png",
        "url": "https://heidicon.ub.uni-heidelberg.de/iiif/2/1111549:575703/full/full/0/default.png"
      },
      {
        "label": "HS_1004_02_left.png",
        "url": "https://heidicon.ub.uni-heidelberg.de/iiif/2/1111550:575704/full/full/0/default.png"
      },
      {
        "label": "HS_1004_03_front.png",
        "url": "https://heidicon.ub.uni-heidelberg.de/iiif/2/1111551:575705/full/full/0/default.png"
      },
      {
        "label": "HS_1004_04_right.png",
        "url": "https://heidicon.ub.uni-heidelberg.de/iiif/2/1111552:575706/full/full/0/default.png"
      },
      {
        "label": "HS_1004_05_bottom.png",
        "url": "https://heidicon.ub.uni-heidelberg.de/iiif/2/1111553:575707/full/full/0/default.png"
      },
      {
        "label": "HS_1004_06_back.png",
        "url": "https://heidicon.ub.uni-heidelberg.de/iiif/2/1111554:575708/full/full/0/default.png"
      }
    ]
  } 
...
}
`

Rendering images may be named in any way at the URL they are hosted, but need to apply to specific naming conventions in the label attribute of the Cuneur file.
The naming convention is TABLETID_SURFACE.EXT, as shown in the example above.
Only in this way, Cuneur can assign the correct surface of the cuneiform tablet to a rendering.

## Integration of photos

The integration of photos follows the same pattern as the integration of renderings.
However, photos are saved in the file js/data/images.js


## Transliteration preparation

Currently, the Cuneur application supports transliterations in the CDLI-ATF format.

The [CDLI-ATF format](http://oracc.museum.upenn.edu/doc/help/editinginatf/cdliatf/index.html) describes the different surfaces of the cuneiform tablet.

Cuneur indexes CDLI-ATF formatted texts automatically and assigns each token in this text a local identifier.

Consider the following example of the text P123456 of the CDLI:

`

@tablet

@obverse

1. 1(disz) sila4 niga
2. ensi2 nibru{ki}
3. 1(disz) sila4 ur-{d}en-lil2-la2
4. 1(disz) amar masz-da3 ur-{d}utu
5. 1(disz) sila4 1(disz) amar masz-da3
6. szu-ru-usz-ki-in
7. 2(disz) amar masz-da3

@reverse
1. e2-a-i3-li2
  blank space
2. mu-kux(DU)
3. iti masz-da3-gu7
4. mu si-mu-ru-um{ki} u3 lu-lu-bu{ki} a-ra2 1(u) la2 1(disz@t)-kam-ma-asz ba-hul

@left
1. u4 2(u) 6(disz)-kam

`

Cuneur will assign the ID "front_1_1" to the word 1(disz) in line 1 on the obverse side of this cuneiform tablet.

The next word "sila4" will get the id "front_1_2" and so on.

### Storing transliterations

Transliterations are stored in the file js/data/transliterations.js in a JSON object.

`
var transliterations={
  "HS_1001": "@tablet...",
  ...
}
`

The key of the JSON object contains the cuneiform tablet ID and the value of the JSON object contains the transliteration in the CDLI-ATF format.

## Integration of 3D Models

3D models of cuneiform tablets in the formats PLY or NXZ can be integrated into Cuneur by adding URLs to these resources in the file 3dmodels.js.

`
var models3D={
  "HS_1004": {
    "ply_url":"https://heidicon.ub.uni-heidelberg.de/eas/partitions/1/0/575000/575702/e3e95552fd0da2aea583c919e60a3b6876f01950/application/x-ply/HS_1004_HeiCuBeDa_GigaMesh.ply",
    "nxz_url": "https://heidicon.ub.uni-heidelberg.de/eas/partitions/3/0/629000/629331/6c0742abaac324b82a12392f17c80cf65b6698e8/application/x-nexus-nxz/HS_1004_HeiCuBeDa_GigaMesh.nxz"
  }
,
...
}
`

The format expects the cuneiform tablet ID and up to one URL per format using the JSON keys specified above.

## Setting Up Your Cuneur Instance

To setup your instance of Cuneur, simply fork this repository.

Once you have forked Cuneur, you will need to configure your Cuneur instances as follows:

1. Create an Access Token for your GitLab project under Settings->Access Tokens. If people should be able to edit in your Cuneur Instance, the Access Token needs to allow for
  - API Rights
  - Reading the repository
  - Writing to the repository
2. Add the Access Token to the file js/conf/annotatorconf.js
3. Configure your Cuneur instance further using parameters in _config.yml 

### Staying up-to-date
Cuneur will receive regular updates in the future, including new features which you might want to use in your fork.

To make use of any updates to Cuneur, you are free to sync any updates from this template repository, as they occur.
