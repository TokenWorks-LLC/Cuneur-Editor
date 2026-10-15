/* Local files use the existing OpenSeadragon + Annotorious editor; no upload/API request. */
var LocalAnnotations = (function() {
  'use strict';
  var localMode = false;
  var photo = null;
  var busy = false;
  var activeEditor = null;
  var editorSequence = 0;
  var catalogSaveControls = new Map();
  var MAX_BYTES = 25 * 1024 * 1024;
  var MAX_PIXELS = 50000000;

  function element(id) { return document.getElementById(id); }
  function message(text, error) {
    element('local-file-status').textContent = text;
    element('local-file-status').style.color = error ? '#a01919' : '#245124';
  }
  function controls() {
    element('local-image-upload').disabled = busy;
    element('local-annotation-import').disabled = busy || !photo;
    element('saveAnnotations').disabled = busy || (localMode && !photo);
    element('catalog-mode').disabled = busy;
    element('catalog-mode').hidden = !localMode;
    ['saveInGit', 'saveInGit3D', 'saveApprovals', 'savetransliteration', 'savetransliterationannotation'].forEach(function(id) {
      var button = element(id);
      if (button && (busy || localMode)) {
        if (!catalogSaveControls.has(button)) catalogSaveControls.set(button, button.disabled);
        button.disabled = true;
      }
    });
    if (!busy && !localMode) {
      catalogSaveControls.forEach(function(disabled, button) { button.disabled = disabled; });
      catalogSaveControls.clear();
    }
    // A local photo has no catalog side sequence. Return to catalog before navigating it.
    ['images', 'imageside'].forEach(function(id) {
      var select = element(id);
      var disabled = busy || localMode;
      select.disabled = disabled;
      if (select.selectize) {
        if (disabled) select.selectize.disable();
        else select.selectize.enable();
      }
    });
    element('local-image-details').textContent = photo ?
      photo.image.name + ' — ' + photo.image.width + ' × ' + photo.image.height + ' original pixels' : '';
  }
  function hasAnnotations() { return anno && anno.getAnnotations().length > 0; }
  function allowReplace(action) {
    return !hasAnnotations() || window.confirm(action + ' will replace the current annotations. Export them first if you want to keep them. Continue?');
  }
  function syncAnnotations() {
    curanno = Object.create(null);
    anno.getAnnotations().forEach(function(a) { curanno[a.id] = a; });
  }
  function disposeEditor(editor) {
    if (!editor || editor.disposed) return;
    editor.disposed = true;
    // Always attempt every cleanup, even if a library's destructor throws.
    [function() { if (editor.anno) editor.anno.destroy(); },
     function() { if (editor.viewer) editor.viewer.destroy(); },
     function() { editor.host.remove(); },
     function() { editor.toolbar.remove(); }].forEach(function(cleanup) {
      try { cleanup(); } catch (error) { console.warn('Could not fully dispose an image editor.', error); }
    });
  }
  function createEditor(currentPhoto) {
    // Prepare in separate DOM nodes. The visible editor, globals, and mode stay intact.
    return new Promise(function(resolve, reject) {
      var editor = { disposed: false };
      var settled = false;
      var timer;
      function stopLoading() {
        window.clearTimeout(timer);
        if (editor.viewer) {
          editor.viewer.removeHandler('open', opened);
          editor.viewer.removeHandler('open-failed', failed);
        }
      }
      function fail(error) {
        if (settled) return;
        settled = true;
        stopLoading();
        disposeEditor(editor);
        reject(error);
      }
      function failed() { fail(new Error('The image viewer could not open this photo. Your previous session is unchanged.')); }
      function opened() {
        if (settled || editor.disposed) return;
        try { editor.anno.setAnnotations([]); }
        catch (error) { fail(error); return; }
        settled = true;
        stopLoading();
        resolve(editor);
      }
      try {
        var host = element('openseadragon');
        var toolbar = element('my-toolbar-container');
        var size = host.getBoundingClientRect();
        editor.host = host.cloneNode(false);
        editor.toolbar = toolbar.cloneNode(false);
        var suffix = ++editorSequence;
        editor.host.id = 'local-image-candidate-' + suffix;
        editor.toolbar.id = 'local-toolbar-candidate-' + suffix;
        editor.host.style.cssText = 'position:absolute;left:-100000px;top:0;visibility:hidden;width:' +
          (size.width || 600) + 'px;height:' + (size.height || 580) + 'px;';
        editor.toolbar.style.cssText = 'position:absolute;left:-100000px;visibility:hidden;';
        host.parentNode.appendChild(editor.host);
        toolbar.parentNode.appendChild(editor.toolbar);
        editor.viewer = OpenSeadragon({
          id: editor.host.id,
          prefixUrl: 'openseadragon/images/',
          toolbar: editor.toolbar.id,
          showRotationControl: true,
          showFlipControl: true,
          sequenceMode: false
        });
        editor.anno = OpenSeadragon.Annotorious(editor.viewer, {
          widgets: [TextMapWidget, 'COMMENT', { widget: 'TAG', vocabulary: mlVocabulary }]
        });
        // This milestone supports sign rectangles. Polygon tools remain in the catalog editor.
        editor.anno.setDrawingTool('rect');
        Annotorious.Toolbar(editor.anno, editor.toolbar, { drawingTools: ['rect'] });
        function changed() {
          if (!editor.disposed && activeEditor === editor && anno === editor.anno) syncAnnotations();
        }
        editor.anno.on('createAnnotation', changed);
        editor.anno.on('updateAnnotation', changed);
        editor.anno.on('deleteAnnotation', changed);
        editor.viewer.addHandler('open', opened);
        editor.viewer.addHandler('open-failed', failed);
        timer = window.setTimeout(function() {
          fail(new Error('The image viewer timed out. Your previous session is unchanged.'));
        }, 20000);
        editor.viewer.open({ type: 'image', url: currentPhoto.url });
      } catch (error) { fail(error); }
    });
  }

  function activateEditor(editor) {
    var previous = activeEditor || {
      viewer: viewer, anno: anno, host: element('openseadragon'), toolbar: element('my-toolbar-container')
    };
    // If a catalog startup completed during loading, retire that latest editor.
    previous.viewer = viewer;
    previous.anno = anno;
    previous.host = element('openseadragon');
    previous.toolbar = element('my-toolbar-container');
    editor.host.style.cssText = previous.host.style.cssText;
    editor.toolbar.style.cssText = previous.toolbar.style.cssText;
    previous.host.replaceWith(editor.host);
    try { previous.toolbar.replaceWith(editor.toolbar); }
    catch (error) { editor.host.replaceWith(previous.host); throw error; }
    editor.host.id = 'openseadragon';
    editor.toolbar.id = 'my-toolbar-container';
    // No asynchronous work between switching mode and replacing shared state.
    localMode = true;
    viewer = editor.viewer;
    anno = editor.anno;
    activeEditor = editor;
    curanno = Object.create(null);
    curcharindex = {};
    curimgindex = {};
    indexedcharids = [];
    indexedchars = 0;
    indexedhiglighted = false;
    visible = true;
    disposeEditor(previous);
  }

  async function readPhoto(file) {
    if (!/\.(png|jpe?g)$/i.test(file.name) ||
        (file.type && !/^image\/(png|jpeg)$/i.test(file.type))) {
      throw new Error('Choose a PNG (.png) or JPEG (.jpg/.jpeg) photo.');
    }
    if (!file.size || file.size > MAX_BYTES) throw new Error('Choose a nonempty photo no larger than 25 MiB.');
    var bytes = await file.arrayBuffer();
    var head = new Uint8Array(bytes, 0, Math.min(bytes.byteLength, 8));
    var png = head.length === 8 && [137, 80, 78, 71, 13, 10, 26, 10].every(function(n, i) { return head[i] === n; });
    var jpeg = head.length >= 3 && head[0] === 255 && head[1] === 216 && head[2] === 255;
    if (!png && !jpeg) throw new Error('The file contents are not PNG or JPEG. Renaming a file does not convert it.');
    if (!window.crypto || !window.crypto.subtle) throw new Error('Open the editor at http://127.0.0.1:4000 so image fingerprinting is available.');
    var digest = await window.crypto.subtle.digest('SHA-256', bytes);
    var hash = Array.from(new Uint8Array(digest)).map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
    // Normalize the Blob MIME type after inspecting the signature (some Windows files have no MIME type).
    var url = URL.createObjectURL(new Blob([bytes], { type: png ? 'image/png' : 'image/jpeg' }));
    try {
      var size = await new Promise(function(resolve, reject) {
        var image = new Image();
        image.onload = function() {
          image.onload = image.onerror = null;
          resolve({ width: image.naturalWidth, height: image.naturalHeight });
        };
        image.onerror = function() {
          image.onload = image.onerror = null;
          reject(new Error('This photo is damaged or cannot be decoded. Choose another PNG or JPEG.'));
        };
        image.src = url;
      });
      if (!size.width || !size.height || size.width * size.height > MAX_PIXELS) {
        throw new Error('Choose a photo with at most 50 million pixels.');
      }
      return { url: url, image: { name: file.name, width: size.width, height: size.height, sha256: hash } };
    } catch (error) { URL.revokeObjectURL(url); throw error; }
  }

  async function upload(file) {
    if (!file || busy) return;
    busy = true;
    controls();
    message('Checking photo…');
    var next;
    var previous = photo;
    var candidate;
    try {
      next = await readPhoto(file);
      if (!allowReplace('Loading a photo')) { URL.revokeObjectURL(next.url); message('Photo change cancelled.'); return; }
      candidate = await createEditor(next);
      activateEditor(candidate);
      photo = next;
      if (previous) URL.revokeObjectURL(previous.url);
      message('Photo ready. Choose the rectangle tool, drag a sign box, enter Transliteration, and click OK. Click an existing box to edit its label or drag its handles. The 3D panel still shows the catalog model.');
    } catch (error) {
      if (next) {
        disposeEditor(candidate);
        URL.revokeObjectURL(next.url);
      }
      message(error.message, true);
    } finally { busy = false; controls(); }
  }

  async function importFile(file) {
    if (!file || busy) return;
    if (!photo) { message('Upload the original photo before importing annotations.', true); return; }
    busy = true;
    controls();
    try {
      if (!/\.json$/i.test(file.name) || !file.size || file.size > MAX_BYTES) {
        throw new Error('Choose a nonempty annotations .json file no larger than 25 MiB.');
      }
      var parsed = LocalAnnotationFormat.parseImport(await file.text(), photo.image);
      if (!allowReplace('Importing annotations')) { message('Import cancelled.'); return; }
      var previous = anno.getAnnotations();
      // A blob URL lasts only for this page visit. Bind imported targets to today's URL.
      parsed.annotations.forEach(function(a) { a.target.source = photo.url; });
      try {
        anno.cancelSelected();
        anno.setAnnotations(parsed.annotations);
        syncAnnotations();
      } catch (error) {
        anno.setAnnotations(previous);
        syncAnnotations();
        throw new Error('The editor could not import these annotations. Your previous annotations were restored.');
      }
      message('Imported ' + parsed.annotations.length + ' annotations.' + (parsed.legacy ?
        ' Legacy JSON has no image fingerprint; check that the boxes match this photo.' : ' Photo fingerprint and original dimensions match.'));
    } catch (error) { message(error.message, true); }
    finally { busy = false; controls(); }
  }

  function exportFile() {
    if (busy) return;
    try {
      if (!localMode) {
        var catalogAnnotations = Object.create(null);
        anno.getAnnotations().forEach(function(a) { catalogAnnotations[a.id] = a; });
        saveTextAsFile(JSON.stringify(catalogAnnotations, null, 2), '.json', 'catalog-annotations');
        return;
      }
      if (!photo) throw new Error('Upload a photo before exporting annotations.');
      var data = LocalAnnotationFormat.createExport(anno.getAnnotations(), photo.image);
      saveTextAsFile(JSON.stringify(data, null, 2), '.json', photo.image.name.replace(/\.[^.]+$/, '') + '.annotations');
      message('Exported ' + Object.keys(data.annotations).length + ' saved annotations. Keep the original photo with the JSON; the photo is not embedded.');
    } catch (error) { message(error.message, true); }
  }

  function initialize() {
    element('local-image-upload').addEventListener('change', function(event) {
      var file = event.target.files[0];
      event.target.value = ''; // Selecting the same file again must still fire change.
      upload(file);
    });
    element('local-annotation-import').addEventListener('change', function(event) {
      var file = event.target.files[0];
      event.target.value = '';
      importFile(file);
    });
    element('catalog-mode').addEventListener('click', function() {
      if (allowReplace('Switching editor mode')) {
        window.location.href = window.location.pathname;
      }
    });
    window.addEventListener('beforeunload', function(event) {
      if (photo && hasAnnotations()) { event.preventDefault(); event.returnValue = ''; }
    });
    controls();
    message('Optional: choose a PNG or JPEG to annotate a local photo. Photos and annotations stay in this browser; export JSON to save your work. OCR is not connected yet.');
  }

  return { initialize: initialize, isLocalMode: function() { return localMode; }, exportFile: exportFile,
    canSaveCatalog: function() { return !localMode && !busy; },
    catalogSaveBlocked: function() {
      message('Catalog saving is unavailable during local photo editing or loading. Use Export Annotations to save local work.', true);
    },
    catalogSaveFinished: function() {
      var button = element('saveInGit');
      if (!button) return;
      // A save may finish while a candidate is loading; restore its completed state if loading fails.
      if (catalogSaveControls.has(button)) catalogSaveControls.set(button, false);
      button.disabled = busy || localMode;
    }
  };
})();
