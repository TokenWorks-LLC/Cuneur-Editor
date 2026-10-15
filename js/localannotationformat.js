/* Pure data checks shared by the local editor and its round-trip tests. */
(function(root) {
  'use strict';
  var FORMAT = 'cuneur-local-annotations';

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }
  function sourceFor(image) { return 'urn:sha256:' + image.sha256; }

  function validateImage(image) {
    if (!isObject(image) || typeof image.name !== 'string' ||
        !Number.isSafeInteger(image.width) || image.width <= 0 ||
        !Number.isSafeInteger(image.height) || image.height <= 0 ||
        typeof image.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(image.sha256)) {
      throw new Error('The annotation file has invalid image metadata.');
    }
  }

  function validateAnnotations(input, image) {
    if (!Array.isArray(input) && !isObject(input)) {
      throw new Error('Annotations must be an array or an object keyed by annotation ID.');
    }
    var annotations = Array.isArray(input) ? input : Object.values(input);
    var ids = new Set();
    annotations.forEach(function(a, index) {
      var prefix = 'Annotation ' + (index + 1) + ': ';
      if (!isObject(a) || a.type !== 'Annotation' || typeof a.id !== 'string' || !a.id.trim()) {
        throw new Error(prefix + 'a type of Annotation and a nonempty ID are required.');
      }
      if (ids.has(a.id)) throw new Error(prefix + 'duplicate ID ' + a.id + '.');
      ids.add(a.id);
      if (!Array.isArray(a.body) || !a.body.every(function(body) {
        return isObject(body) && body.type === 'TextualBody' && typeof body.value === 'string' &&
          (body.purpose === undefined || typeof body.purpose === 'string');
      })) {
        throw new Error(prefix + 'body must be an array of TextualBody entries with text values.');
      }
      var target = a.target;
      var selector = isObject(target) && target.selector;
      if (!isObject(selector) || selector.type !== 'FragmentSelector' ||
          typeof selector.value !== 'string') {
        throw new Error(prefix + 'only rectangular FragmentSelector sign boxes are supported.');
      }
      // Pixel coordinates come directly from Annotorious, never from the displayed canvas size.
      var match = /^xywh=pixel:(\d+(?:\.\d+)?),(\d+(?:\.\d+)?),(\d+(?:\.\d+)?),(\d+(?:\.\d+)?)$/.exec(selector.value);
      if (!match) throw new Error(prefix + 'expected xywh=pixel:x,y,width,height coordinates.');
      var box = match.slice(1).map(Number);
      if (!box.every(Number.isFinite) || box[2] <= 0 || box[3] <= 0 ||
          box[0] + box[2] > image.width + 0.01 || box[1] + box[3] > image.height + 0.01) {
        throw new Error(prefix + 'the box must have positive dimensions and fit inside the original image.');
      }
      if (typeof target.source === 'string' && target.source.startsWith('urn:sha256:') &&
          target.source !== sourceFor(image)) {
        throw new Error(prefix + 'this annotation belongs to a different image.');
      }
    });
    if (!Array.isArray(input)) {
      Object.keys(input).forEach(function(key) {
        if (input[key].id !== key) throw new Error('Annotation object keys must match their annotation IDs.');
      });
    }
    return clone(annotations);
  }

  function createExport(annotations, image) {
    validateImage(image);
    var checked = validateAnnotations(annotations, image);
    var keyed = Object.create(null);
    checked.forEach(function(a) {
      a.target.source = sourceFor(image);
      keyed[a.id] = a;
    });
    return { format: FORMAT, version: 1, image: clone(image), annotations: keyed };
  }

  function parseImport(text, image) {
    validateImage(image);
    var data;
    try { data = JSON.parse(text); }
    catch (error) { throw new Error('This file is not valid JSON. Choose an exported annotations .json file.'); }
    var legacy = !(isObject(data) && ('format' in data || 'annotations' in data || 'version' in data));
    var input = data;
    if (!legacy) {
      if (data.format !== FORMAT || data.version !== 1) {
        throw new Error('Unsupported annotation format or version. Expected a Cuneur local version 1 export.');
      }
      validateImage(data.image);
      if (data.image.sha256 !== image.sha256 || data.image.width !== image.width || data.image.height !== image.height) {
        throw new Error('These annotations belong to a different photo. Upload the original, unchanged image first.');
      }
      input = data.annotations;
    }
    return { annotations: validateAnnotations(input, image), legacy: legacy };
  }

  var api = { createExport: createExport, parseImport: parseImport, sourceFor: sourceFor };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LocalAnnotationFormat = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
