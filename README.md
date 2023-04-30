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

### Integration of hosted images into Cuneur

Once images have been selected and hosted for the annotation with Cuneur, the images have to be linked in the Cuneur application. 

## Transliteration preparation

