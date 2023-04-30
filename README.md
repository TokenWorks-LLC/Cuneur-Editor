# Cuneur Template

This repository is a template repository for the usage of the Cuneur - Cuneiform Annotator application.

This README aims to guide the user to get started with annotating a new set of images of cuneiform tablet contents.

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

Once images have been selected and hosted for the annotation with Cuneur, the images have to be linked in the Cuneur application. 

To do that they have to be added to the file js/data/renderings.js

`
var urls={
"HS_0044": {
  "label": "HS_0044",
  "variants": [
      {
        "label": "HS_0044_01_top.png",
        "url": "https://heidicon.ub.uni-heidelberg.de/iiif/2/1107976:570673/full/full/0/default.png"
      },
      {
        "label": "HS_0044_02_left.png",
        "url": "https://heidicon.ub.uni-heidelberg.de/iiif/2/1107977:570674/full/full/0/default.png"
      },
      {
        "label": "HS_0044_04_right.png",
        "url": "https://heidicon.ub.uni-heidelberg.de/iiif/2/1107978:570675/full/full/0/default.png"
      },
      {
        "label": "HS_0044_05_bottom.png",
        "url": "https://heidicon.ub.uni-heidelberg.de/iiif/2/1107979:570676/full/full/0/default.png"
      },
      {
        "label": "HS_0044_06_back.png",
        "url": "https://heidicon.ub.uni-heidelberg.de/iiif/2/1107980:570677/full/full/0/default.png"
      },
      {
        "label": "HS_0044_03_front.png",
        "url": "https://heidicon.ub.uni-heidelberg.de/iiif/2/1108249:570905/full/full/0/default.png"
      }
    ]
  }
...
}
`

Images may be named in any way at the URL they are hosted, but need to apply to specific naming conventions in the label attribute of the Cuneur file.
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







