# TokenWorks Cuneur Editor

A cuneiform tablet annotation editor based on [Cuneur](https://gitlab.com/tacume/cuneur/cuneur_template). This version adds local photo upload and annotation import/export while preserving the original tablet catalog and 3D interface.

## Features

- Load local PNG and JPEG images.
- Draw, move, resize, and delete rectangular sign annotations.
- Enter and edit transliteration labels.
- Export annotations as JSON and import them onto the original image.
- Check image fingerprints and dimensions to prevent mismatched imports.
- Continue using the original catalog and 3D viewer.

**OCR predictions are not connected yet.** Local photos are processed in the browser and are not uploaded to a server. The application still uses external libraries and catalog resources, so an internet connection is required.

## Local setup

The instructions below describe the Windows PowerShell setup used during development.

### Prerequisites

- Git
- Ruby 3.3 with RubyInstaller DevKit
- Bundler
- Node.js, if you want to run the automated tests

### Install and run

Clone the repository and enter its root directory:

```powershell
git clone https://github.com/TokenWorks-LLC/Cuneur-Editor.git
cd Cuneur-Editor
```

Install dependencies:

```powershell
bundle.bat install
```

Create a local configuration file:

```powershell
Set-Content -Path _config.local.yml -Value 'baseurl: ""' -Encoding ascii
```

Start the development server:

```powershell
bundle.bat exec jekyll serve --config "_config.yml,_config.local.yml"
```

Open:

http://127.0.0.1:4000/annotator.html

Keep the terminal running while using the editor. Press Ctrl+C to stop the server.

The local configuration overrides the upstream deployment path. Keep machine-specific configuration out of shared commits.

## Annotating a local photo

1. Expand **Local image upload and annotation import**.
2. Under **Tablet photo (PNG/JPEG)**, choose an image.
3. Select the rectangle tool and draw a box around a sign.
4. Enter its **Transliteration** label and click **OK**.
5. Click a box to edit its label or adjust its position and size. Click **OK** to save each edit.
6. Click **Export Annotations** to download the JSON file.

Images must be nonempty, no larger than 25 MiB, and contain no more than 50 million pixels.

### Restoring saved work

1. Upload the same original photo.
2. Under **Import annotations (.json)**, select its exported JSON.
3. Confirm that the restored boxes and labels match.

The photo chooser accepts images; the annotation import chooser accepts JSON.

Keep the original photo alongside its JSON file. The image is not embedded in the export. Refreshing or closing the page clears the current in-memory session.

Import replaces the current annotations. The editor asks for confirmation before replacing a nonempty set.

## Export format

Local exports use the versioned `cuneur-local-annotations` format:

```json
{
  "format": "cuneur-local-annotations",
  "version": 1,
  "image": {
    "name": "tablet.png",
    "width": 827,
    "height": 832,
    "sha256": "<SHA-256 fingerprint of the original file>"
  },
  "annotations": {}
}
```

The `annotations` object is keyed by annotation ID. Each annotation contains a Web Annotation `body` array and a rectangular selector:

```text
xywh=pixel:x,y,width,height
```

Coordinates refer to the original image pixels, rather than the displayed image size.

New-format imports require matching image fingerprints and dimensions. Renaming the original image is supported; resizing or recompressing it changes its fingerprint.

Legacy ID-keyed annotation objects and annotation arrays are also supported when their contents are valid. Because legacy files may lack image identity metadata, check alignment after importing.

The local workflow supports rectangular pixel selectors. Polygon and percentage selectors are not supported.

## Catalog and 3D behavior

The page opens in the original two-column catalog view. Local upload replaces the left-hand image editor; the right-hand 3D viewer continues to display the catalog model.

During local editing:

- Tablet and side selectors are disabled.
- Catalog repository save operations are blocked.
- Local JSON export remains available.

Export your work before selecting **Return to tablet catalog**, which reloads the page.

Local annotation does not require GitLab credentials. Catalog repository saving requires separate configuration and authorization. Do not place real access tokens in committed browser JavaScript.

## Validation

Build the site:

```powershell
bundle.bat exec jekyll build --config "_config.yml,_config.local.yml"
```

Run the automated regression tests:

```powershell
node _tests/localannotations.test.cjs
```

The regression suite uses simulated DOM, viewer, timer, and repository adapters. It covers annotation round trips, validation, upload failure recovery, delayed callbacks, and catalog save isolation. It does not perform real repository writes or replace browser testing.

### Browser checklist

- Confirm the original catalog view and 3D controls load.
- Upload a local photo and create two labeled boxes.
- Paste a replacement label, move or resize a box, and save.
- Export, reload, upload the unchanged photo, and import.
- Confirm labels and box positions are preserved.
- Try invalid JSON and annotations for a different photo; existing work should remain intact.
- Confirm catalog save controls are disabled during local editing.
- Return to the catalog and confirm navigation works.

## Code overview

| File | Purpose |
| --- | --- |
| `_layouts/default.html` | Main interface, catalog startup, and local controls |
| `js/localannotations.js` | Local photo loading, editor lifecycle, and import/export actions |
| `js/localannotationformat.js` | Annotation validation and export format |
| `js/annotatorfunctions.js` | Existing annotation widgets and catalog helpers |
| `js/conf/annotatorconf.js` | Catalog configuration and repository save guards |
| `_tests/localannotations.test.cjs` | Automated regression tests |

## Current scope

This repository provides a local annotation workflow. Automatic OCR prediction, persistent server storage, and integration into the TokenWorks website remain separate integration tasks.

## Upstream attribution

This project builds on the Cuneur Cuneiform Annotator. The original catalog, transliteration, and 3D functionality comes from the upstream project.

- [Upstream repository](https://gitlab.com/tacume/cuneur/cuneur_template)
- [Upstream documentation](https://gitlab.com/fcgl/cuneur-template/-/wikis/home)

Preserve the upstream copyright and license notices when distributing or modifying the code.