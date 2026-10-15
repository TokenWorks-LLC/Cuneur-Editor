/* Run with Node.js: node _tests/localannotations.test.cjs (no npm dependencies). */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');
const format = require('../js/localannotationformat.js');
const image = { name: 'tablet.png', width: 2400, height: 1800, sha256: 'a'.repeat(64) };
const box = {
  '@context': 'http://www.w3.org/ns/anno.jsonld', type: 'Annotation', id: '#sign-1',
  body: [{ type: 'TextualBody', purpose: 'Transliteration', value: 'du₃' }],
  target: { source: 'blob:old-session', selector: {
    type: 'FragmentSelector', conformsTo: 'http://www.w3.org/TR/media-frags/', value: 'xywh=pixel:1200.25,600.5,240.75,180.5'
  } }
};
const copy = value => JSON.parse(JSON.stringify(value));

function browserHarness(options = {}) {
  const nodes = new Set();
  const root = { children: [], appendChild(child) { child.remove(); this.children.push(child); child.parentNode = this; } };
  function makeNode(id) {
    const result = { id, textContent: '', value: '', style: { cssText: '' }, disabled: false,
      handlers: {}, selectedIndex: 0, parentNode: null, addEventListener(type, fn) { this.handlers[type] = fn; },
      get isConnected() { return this.parentNode !== null; },
      getBoundingClientRect: () => ({ width: 600, height: 580 }),
      cloneNode() { const cloned = makeNode(this.id); cloned.style.cssText = this.style.cssText; return cloned; },
      remove() {
        if (this.parentNode) this.parentNode.children.splice(this.parentNode.children.indexOf(this), 1);
        this.parentNode = null;
      },
      replaceWith(replacement) {
        const parent = this.parentNode;
        assert.ok(parent, 'only a mounted node can be replaced');
        replacement.remove();
        parent.children[parent.children.indexOf(this)] = replacement;
        replacement.parentNode = parent; this.parentNode = null;
      }
    };
    nodes.add(result);
    return result;
  }
  function findNode(id) { return [...nodes].find(n => n.id === id && n.isConnected) || null; }
  function node(id) {
    let result = findNode(id);
    if (!result) { result = makeNode(id); root.appendChild(result); }
    return result;
  }
  const state = { current: [], downloads: [], revocations: [], urls: 0, editorCount: 0, confirms: true,
    viewers: [], editors: [], timers: new Map(), nodes };
  for (const id of ['local-image-upload', 'local-annotation-import', 'local-file-status', 'local-image-details',
    'catalog-mode', 'saveAnnotations', 'images', 'imageside', '3dimages', 'openseadragon', 'my-toolbar-container',
    'saveInGit', 'saveInGit3D', 'saveApprovals', 'savetransliteration', 'savetransliterationannotation', 'dataformaturl']) node(id);
  const context = {
    URLSearchParams, ArrayBuffer, Uint8Array, Blob, Set, Promise,
    LocalAnnotationFormat: format, TextMapWidget() {}, mlVocabulary: [],
    anno: null, viewer: null, curanno: {}, curcharindex: {}, curimgindex: {},
    indexedcharids: [], indexedchars: 0, indexedhiglighted: false, visible: true,
    document: { getElementById: findNode, querySelectorAll: () => [] },
    window: { location: { search: '', pathname: '/annotator.html' }, crypto: webcrypto,
      setTimeout(fn, ms) {
        const timer = setTimeout(() => { state.timers.delete(timer); fn(); }, ms);
        state.timers.set(timer, fn); return timer;
      },
      clearTimeout(timer) { clearTimeout(timer); state.timers.delete(timer); },
      confirm: () => state.confirms, addEventListener() {} },
    URL: { createObjectURL: () => 'blob:session-' + (++state.urls), revokeObjectURL: url => state.revocations.push(url) },
    Image: class {
      get naturalWidth() { return state.decodeWidth || image.width; }
      get naturalHeight() { return state.decodeHeight || image.height; }
      set src(value) { Promise.resolve().then(() => state.decodeFailure ? this.onerror() : this.onload()); }
    },
    saveTextAsFile(text, extension, name) { state.downloads.push({ text, extension, name }); }
  };
  function OpenSeadragon(config) {
    state.editorCount++;
    const handlers = {};
    const instance = { handlers, element: node(config.id), addOnceHandler: (type, fn) => { handlers[type] = fn; },
      addHandler: (type, fn) => { handlers[type] = fn; },
      removeHandler(type, fn) { if (handlers[type] === fn) delete handlers[type]; },
      destroy() { this.destroyed = true; },
      isFullPage: () => false, currentPage: () => 0, goToPage() {}, screenshot() {},
      open(source) {
        state.openedSource = source;
        instance.source = source;
        instance.lateOpen = handlers.open;
        instance.lateFailure = handlers['open-failed'];
        const finish = () => {
          if (state.failNextOpen) { state.failNextOpen = false; instance.lateFailure?.(); }
          else instance.lateOpen?.();
        };
        if (state.holdNextOpen) { state.holdNextOpen = false; state.pendingOpen = finish; }
        else Promise.resolve().then(finish);
      } };
    state.viewers.push(instance);
    return instance;
  }
  OpenSeadragon.Annotorious = () => {
    const instance = { data: [], events: {}, destroy() { this.destroyed = true; }, setDrawingTool() {}, cancelSelected() {},
      setAuthInfo() { state.authUpdates = (state.authUpdates || 0) + 1; },
      getAnnotations: () => copy(instance.data),
      setAnnotations: annotations => {
        instance.data = copy(annotations);
        if (state.failNextSet) { state.failNextSet = false; throw new Error('Rejected by editor'); }
      },
      on: (type, fn) => { instance.events[type] = fn; } };
    state.editors.push(instance);
    return instance;
  };
  context.OpenSeadragon = OpenSeadragon;
  Object.defineProperty(state, 'current', {
    get: () => context.anno?.data || [], set: value => { context.anno.data = value; }
  });
  Object.defineProperty(state, 'events', { get: () => context.anno?.events || {} });
  context.Annotorious = { BetterPolygon() {}, SelectorPack() {},
    Toolbar: (anno, container, options) => { state.toolbarOptions = options; } };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/localannotations.js'), 'utf8'), context);
  if (options.initialize !== false) context.LocalAnnotations.initialize();
  async function select(id, file) {
    node(id).handlers.change({ target: { files: [file], value: file.name } });
    for (let i = 0; node('local-image-upload').disabled && i < 100; i++) {
      await new Promise(resolve => setTimeout(resolve, 5));
    }
    assert.equal(node('local-image-upload').disabled, false, 'file operation must finish');
  }
  return { context, state, node, select };
}

// Execute the actual catalog functions and inline startup scripts. Only the browser,
// network, and rendering libraries are simulated; no GitLab request or write is made.
function catalogHarness(options = {}) {
  const h = browserHarness({ initialize: false });
  const { context, state, node } = h;
  Object.assign(state, { ready: [], requests: [], spotRequests: [], auth: [], warnings: [], scenes: [] });
  function jquery(selector) {
    if (selector === context.document) return { ready: fn => state.ready.push(fn) };
    const id = /^#([^ :]+)/.exec(selector)?.[1];
    const target = node(id || selector);
    const chain = {
      val(value) {
        if (value !== undefined) { target.value = value; return chain; }
        if (id === 'images') return 'HS_TEST';
        if (id === 'imageside') return 'https://images.test/tablet.png';
        if (id === '3dimages') return 'https://models.test/tablet.ply';
        return target.value;
      },
      text() { return id === '3dimages' ? 'MODEL_TEST' : id === 'imageside' ? 'HS_TEST_front.png' : ''; },
      html(value) { if (value !== undefined) target.innerHTML = value; return chain; },
      prop(key, value) { if (value !== undefined) { target[key] = value; return chain; } return target[key]; },
      selectize() {
        target.selectize = {
          disable() { target.selectizeDisabled = true; }, enable() { target.selectizeDisabled = false; }
        };
        return chain;
      }
    };
    for (const method of ['mouseenter', 'mouseout', 'mousedown', 'mouseup', 'on', 'css', 'attr', 'each']) {
      chain[method] = () => chain;
    }
    return chain;
  }
  jquery.ajaxSetup = () => {};
  jquery.getJSON = (url, success) => {
    const request = { url, success }; state.requests.push(request);
    return { fail(fn) { request.failure = fn; return this; } };
  };
  jquery.ajax = config => new Promise((resolve, reject) => {
    state.spotRequests.push({ config, resolve, reject });
  });
  Object.assign(context, {
    $: jquery, jQuery: jquery, location: context.window.location,
    console: { log() {}, warn(...args) { state.warnings.push(args); } },
    renderingurls: { HS_TEST: { variants: [{ label: 'HS_TEST_front.png', url: 'https://images.test/tablet.png' }] } },
    models3D: { MODEL_TEST: { bbox: {} } }, transliterations: {}, hs2CDLI: {}, periods: {}, languages: {},
    threedimageToIndex: {}, translitcount: {}, gitlabhost: 'https://gitlab.test', repositoryid: 1,
    branch: 'main', gitlabtoken: 'TEST-ONLY', TurntablePanTrackball: {},
    init3dhop() {
      state.init3DCalls = (state.init3DCalls || 0) + 1;
      if (options.fail3DInit) throw new Error('WebGL unavailable');
    },
    Presenter: function() {
      if (options.fail3DModel) throw new Error('Model renderer failed');
      this.setScene = scene => state.scenes.push(scene);
    },
    getCurrentUser: () => ({ then(fn) { state.auth.push(fn); } })
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/annotatorfunctions.js'), 'utf8'), context);
  const layout = fs.readFileSync(path.join(__dirname, '../_layouts/default.html'), 'utf8');
  for (const tag of layout.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
    if (tag[1].trim()) vm.runInContext(tag[1], context);
  }
  // These unrelated rich-text/metadata features do not need DOM renderers for these tests.
  context.addTransliterationOverlay = () => {};
  context.manageApprovals = () => {};
  context.loadRecogito = () => { state.recogitoCalls = (state.recogitoCalls || 0) + 1; };
  h.layout = layout;
  return h;
}
function photoFile(name = 'tablet.png', bytes = [137, 80, 78, 71, 13, 10, 26, 10]) {
  return { name, type: name.endsWith('.jpg') ? 'image/jpeg' : 'image/png', size: bytes.length,
    arrayBuffer: async () => Uint8Array.from(bytes).buffer };
}
function jsonFile(data) {
  const text = typeof data === 'string' ? data : JSON.stringify(data);
  return { name: 'annotations.json', size: text.length, text: async () => text };
}

function attachCatalogSaving(h) {
  const { context, state } = h;
  state.writes = [];
  context.approvals = {};
  const previousAuth = context.getCurrentUser;
  context.gitbeaker = { Gitlab: class {
    constructor() {
      this.RepositoryFiles = {
        create(...args) {
          state.writes.push({ operation: 'create', args });
          if (state.deferCreate) return new Promise((resolve, reject) => { state.pendingCreate = { resolve, reject }; });
          if (state.rejectCreate) return Promise.reject(new Error('File already exists'));
          return Promise.resolve({});
        },
        edit(...args) { state.writes.push({ operation: 'edit', args }); return Promise.resolve({}); }
      };
    }
  } };
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/conf/annotatorconf.js'), 'utf8'), context);
  context.getCurrentUser = previousAuth;
}

async function waitForCandidate(h) {
  for (let i = 0; !h.state.pendingOpen && i < 100; i++) await new Promise(resolve => setTimeout(resolve, 5));
  assert.ok(h.state.pendingOpen, 'candidate must start opening');
  return h.state.viewers.at(-1);
}

async function run() {
  const passed = [];
  async function test(name, fn) { await fn(); passed.push(name); }
  await test('export/import keeps Unicode labels, decimal original-pixel boxes, IDs, and body arrays', () => {
    const before = copy(box);
    const exported = format.createExport([box], image);
    const imported = format.parseImport(JSON.stringify(exported), image);
    assert.equal(imported.legacy, false);
    assert.equal(imported.annotations[0].body[0].value, 'du₃');
    assert.deepEqual(imported.annotations[0].target.selector, box.target.selector);
    assert.equal(imported.annotations[0].id, box.id);
    assert.equal(imported.annotations[0].target.source, format.sourceFor(image));
    assert.deepEqual(box, before, 'export must not change live editor objects');
  });
  await test('editing label and resizing box survives another round trip', () => {
    const edited = copy(box);
    edited.body[0].value = 'an';
    edited.target.selector.value = 'xywh=pixel:1000,400,300,200';
    const result = format.parseImport(JSON.stringify(format.createExport([edited], image)), image);
    assert.equal(result.annotations[0].body[0].value, 'an');
    assert.equal(result.annotations[0].target.selector.value, edited.target.selector.value);
  });
  await test('renaming identical image is allowed; different bytes or dimensions are rejected', () => {
    const text = JSON.stringify(format.createExport([box], image));
    assert.equal(format.parseImport(text, { ...image, name: 'renamed.png' }).annotations.length, 1);
    assert.throws(() => format.parseImport(text, { ...image, sha256: 'b'.repeat(64) }), /different photo/);
    assert.throws(() => format.parseImport(text, { ...image, width: 1200 }), /different photo/);
  });
  await test('legacy keyed-object and array exports import with a legacy notice', () => {
    for (const data of [[box], { [box.id]: box }]) {
      assert.equal(format.parseImport(JSON.stringify(data), image).legacy, true);
    }
  });
  await test('malformed JSON, invalid structures, duplicate IDs, and mismatched keys are rejected', () => {
    assert.throws(() => format.parseImport('{', image), /not valid JSON/);
    for (const data of [null, 7, 'text', [null], [{ ...box, body: {} }], [box, box], { wrong: box }]) {
      assert.throws(() => format.parseImport(JSON.stringify(data), image));
    }
    const data = format.createExport([box], image);
    data.version = 2;
    assert.throws(() => format.parseImport(JSON.stringify(data), image), /version/);
  });
  await test('invalid, percentage, empty, negative, and out-of-image boxes are rejected', () => {
    for (const value of ['xywh=percent:10,10,20,20', 'xywh=pixel:-1,2,3,4',
      'xywh=pixel:1,2,0,4', 'xywh=pixel:2390,0,20,30', 'xywh=pixel:1,2,3,NaN']) {
      const invalid = copy(box); invalid.target.selector.value = value;
      assert.throws(() => format.parseImport(JSON.stringify([invalid]), image));
    }
    const invalid = copy(box); invalid.target.selector.type = 'SvgSelector';
    assert.throws(() => format.parseImport(JSON.stringify([invalid]), image), /rectangular/);
  });
  await test('empty exports round-trip and special IDs remain data', () => {
    assert.deepEqual(format.parseImport(JSON.stringify(format.createExport([], image)), image).annotations, []);
    const special = { ...copy(box), id: '__proto__' };
    assert.equal(format.parseImport(JSON.stringify(format.createExport([special], image)), image).annotations[0].id, '__proto__');
  });
  await test('local controls start in catalog mode without replacing its viewer or toolbar', () => {
    const h = browserHarness();
    assert.equal(h.context.LocalAnnotations.isLocalMode(), false);
    assert.equal(h.state.editorCount, 0);
    assert.equal(h.node('my-toolbar-container').textContent, '');
    assert.equal(h.node('saveAnnotations').disabled, false);
    assert.equal(h.node('local-annotation-import').disabled, true);
    assert.equal(h.node('catalog-mode').hidden, true);
    assert.equal(h.node('images').disabled, false);
    assert.equal(h.node('imageside').disabled, false);
    assert.match(h.node('local-file-status').textContent, /OCR is not connected/);
  });
  await test('upload, create, update, export, reload, import, and delete use the editor store', async () => {
    const h = browserHarness();
    await h.select('local-image-upload', photoFile());
    assert.equal(h.node('local-annotation-import').disabled, false);
    assert.equal(h.state.openedSource.type, 'image');
    assert.deepEqual(Array.from(h.state.toolbarOptions.drawingTools), ['rect']);
    h.state.current = [copy(box)]; h.state.events.createAnnotation();
    h.state.current[0].body[0].value = 'an';
    h.state.current[0].target.selector.value = 'xywh=pixel:100,200,300,400';
    h.state.events.updateAnnotation();
    h.context.LocalAnnotations.exportFile();
    const download = h.state.downloads[0];
    assert.equal(download.extension, '.json');
    const saved = JSON.parse(download.text);
    assert.equal(saved.annotations[box.id].body[0].value, 'an');
    assert.equal(saved.annotations[box.id].target.selector.value, 'xywh=pixel:100,200,300,400');
    const fresh = browserHarness();
    await fresh.select('local-image-upload', photoFile());
    await fresh.select('local-annotation-import', jsonFile(saved));
    assert.equal(fresh.state.current[0].body[0].value, 'an');
    assert.equal(fresh.state.current[0].target.source, fresh.state.openedSource.url);
    fresh.context.LocalAnnotations.exportFile();
    assert.deepEqual(JSON.parse(fresh.state.downloads[0].text), saved);
    fresh.state.current = []; fresh.state.events.deleteAnnotation();
    fresh.context.LocalAnnotations.exportFile();
    assert.equal(Object.keys(JSON.parse(fresh.state.downloads[1].text).annotations).length, 0);
  });
  await test('invalid imports and cancelled replacement preserve current annotations', async () => {
    const h = browserHarness();
    await h.select('local-image-upload', photoFile());
    h.state.current = [copy(box)];
    await h.select('local-annotation-import', jsonFile('{'));
    assert.deepEqual(h.state.current, [box]);
    assert.match(h.node('local-file-status').textContent, /not valid JSON/);
    h.state.confirms = false;
    await h.select('local-annotation-import', jsonFile([]));
    assert.deepEqual(h.state.current, [box]);
    assert.match(h.node('local-file-status').textContent, /cancelled/);
    await h.select('local-image-upload', photoFile('another.png'));
    assert.deepEqual(h.state.current, [box]);
    assert.equal(h.state.editorCount, 1);
    assert.equal(h.state.revocations.length, 1);
  });
  await test('invalid photo type, signature, size, and different-photo imports preserve work', async () => {
    const h = browserHarness();
    await h.select('local-image-upload', photoFile());
    h.state.current = [copy(box)];
    for (const invalid of [photoFile('text.txt'), photoFile('renamed.png', [1, 2, 3]),
      { ...photoFile(), size: 26 * 1024 * 1024 }]) {
      await h.select('local-image-upload', invalid);
      assert.deepEqual(h.state.current, [box]);
      assert.equal(h.state.editorCount, 1);
    }
    await h.select('local-annotation-import', jsonFile(format.createExport([box], image)));
    assert.match(h.node('local-file-status').textContent, /different photo/);
    assert.deepEqual(h.state.current, [box]);
    const jpeg = browserHarness();
    await jpeg.select('local-image-upload', photoFile('tablet.jpg', [255, 216, 255, 224]));
    assert.equal(jpeg.node('local-annotation-import').disabled, false);
  });
  await test('decoder errors and excessive image dimensions leave the old editor intact', async () => {
    const h = browserHarness();
    await h.select('local-image-upload', photoFile());
    h.state.current = [copy(box)];
    h.state.decodeFailure = true;
    await h.select('local-image-upload', photoFile());
    assert.match(h.node('local-file-status').textContent, /damaged/);
    assert.deepEqual(h.state.current, [box]);
    h.state.decodeFailure = false;
    h.state.decodeWidth = 10000; h.state.decodeHeight = 10000;
    await h.select('local-image-upload', photoFile());
    assert.match(h.node('local-file-status').textContent, /50 million/);
    assert.deepEqual(h.state.current, [box]);
    assert.equal(h.state.editorCount, 1);
  });
  await test('viewer opening failure restores the previous photo and annotations', async () => {
    const h = browserHarness();
    await h.select('local-image-upload', photoFile());
    h.state.current = [copy(box)];
    const originalUrl = h.state.openedSource.url;
    const originalViewer = h.context.viewer;
    const originalAnno = h.context.anno;
    h.state.failNextOpen = true;
    await h.select('local-image-upload', photoFile('replacement.png'));
    assert.equal(h.context.viewer, originalViewer);
    assert.equal(h.context.anno, originalAnno);
    assert.equal(h.context.viewer.source.url, originalUrl);
    assert.deepEqual(h.state.current, [box]);
    assert.match(h.node('local-file-status').textContent, /could not open/);
    assert.equal(h.node('saveAnnotations').disabled, false);
  });
  await test('editor import failure rolls back even after partial replacement', async () => {
    const h = browserHarness();
    await h.select('local-image-upload', photoFile());
    h.state.current = [copy(box)]; h.state.failNextSet = true;
    await h.select('local-annotation-import', jsonFile([]));
    assert.deepEqual(h.state.current, [box]);
    assert.match(h.node('local-file-status').textContent, /restored/);
  });
  await test('original two-column layout has collapsed local tools and Export beside the catalog', () => {
    const h = catalogHarness();
    assert.equal((h.layout.match(/class="col-md-6"/g) || []).length, 2);
    assert.doesNotMatch(h.layout, /catalog-only|col-md-12|annotation-panel/);
    const details = /<details\b[^>]*id="local-image-tools"[^>]*>/.exec(h.layout)[0];
    assert.doesNotMatch(details, /\bopen\b/);
    assert.ok(h.layout.indexOf('id="images"') < h.layout.indexOf('id="saveAnnotations"'));
    assert.ok(h.layout.indexOf('id="saveAnnotations"') < h.layout.indexOf(details));
    assert.match(h.layout, /id="tabs-3dmodel"/);
  });
  await test('actual default startup loads catalog, runs window.onload, and initializes 3D independently', async () => {
    const h = catalogHarness();
    h.state.ready[0]();
    assert.equal(h.context.LocalAnnotations.isLocalMode(), false);
    assert.ok(h.state.requests.some(r => r.url.includes('result%2F')));
    assert.ok(h.state.requests.some(r => r.url.includes('resulttextanno%2F')));
    assert.equal(h.state.editorCount, 1);
    h.context.window.onload();
    assert.equal(h.state.editorCount, 2);
    h.state.ready[1]();
    assert.equal(h.state.init3DCalls, 1);
    assert.equal(h.state.spotRequests.length, 6);
    assert.ok(h.state.spotRequests.every(r => r.config.async === true));
    for (const request of h.state.spotRequests) request.resolve({});
    await new Promise(resolve => setTimeout(resolve, 0));
    assert.equal(h.state.scenes.length, 1);
    assert.equal(h.state.scenes[0].meshes.mesh_1.url, 'https://models.test/tablet.ply');
    // The guard also permits real catalog responses before a local photo is selected.
    const catalogBox = copy(box);
    h.state.requests.find(r => r.url.includes('result%2F')).success({ [box.id]: catalogBox });
    assert.equal(h.state.current[0].id, box.id);
  });
  await test('late catalog JSON, authentication, page events, and onload cannot overwrite a local photo', async () => {
    const h = catalogHarness();
    h.state.ready[0]();
    h.context.window.onload();
    h.context.initAnnotationsForPage({ page: 0 });
    const oldViewers = [...h.state.viewers];
    const oldEditors = [...h.state.editors];
    function replayCatalogWork() {
      const stale = { ...copy(box), id: '#stale-catalog' };
      for (const request of h.state.requests) {
        request.success({ [stale.id]: stale });
        request.failure?.();
      }
      for (const auth of h.state.auth) auth({ id: 'catalog-user', username: 'catalog-user' });
      for (const viewer of oldViewers) {
        viewer.handlers.page?.({ page: 0 });
        viewer.handlers['pre-full-page']?.({ fullPage: true });
      }
      for (const editor of oldEditors) {
        for (const type of ['createAnnotation', 'updateAnnotation', 'deleteAnnotation',
          'mouseEnterAnnotation', 'mouseLeaveAnnotation', 'selectAnnotation']) editor.events[type]?.(stale);
      }
      h.context.window.onload();
      h.context.loadVariants(); h.context.reinit(); h.context.reinitOSD(); h.context.arrangeFatCross();
    }
    h.state.holdNextOpen = true;
    const catalogViewer = h.context.viewer;
    const catalogAnno = h.context.anno;
    const uploading = h.select('local-image-upload', photoFile());
    for (let i = 0; !h.state.pendingOpen && i < 100; i++) await new Promise(resolve => setTimeout(resolve, 5));
    assert.ok(h.state.pendingOpen, 'local viewer must start opening');
    assert.equal(h.context.LocalAnnotations.isLocalMode(), false, 'catalog stays live until the candidate opens');
    assert.equal(h.context.viewer, catalogViewer);
    assert.equal(h.context.anno, catalogAnno);
    h.state.pendingOpen();
    await uploading;
    assert.equal(h.context.LocalAnnotations.isLocalMode(), true);
    const localViewer = h.context.viewer;
    const localAnno = h.context.anno;
    const edited = copy(box); edited.body[0].value = 'local correction';
    h.state.current = [edited]; h.state.events.createAnnotation();
    replayCatalogWork();
    assert.equal(h.context.viewer, localViewer);
    assert.equal(h.context.anno, localAnno);
    assert.equal(Object.keys(h.context.curanno).length, 1);
    assert.equal(h.context.curanno[box.id].body[0].value, 'local correction');
    assert.equal(h.state.authUpdates || 0, 0);
    assert.equal(h.state.recogitoCalls || 0, 0);
    h.context.LocalAnnotations.exportFile();
    assert.equal(JSON.parse(h.state.downloads[0].text).annotations[box.id].body[0].value, 'local correction');
  });
  await test('local photo disables catalog navigation and Return reloads the original default', async () => {
    const h = catalogHarness(); h.state.ready[0]();
    await h.select('local-image-upload', photoFile());
    assert.equal(h.node('images').disabled, true);
    assert.equal(h.node('images').selectizeDisabled, true);
    assert.equal(h.node('imageside').disabled, true);
    assert.equal(h.node('catalog-mode').hidden, false);
    h.state.current = [copy(box)]; h.state.confirms = false;
    h.node('catalog-mode').handlers.click();
    assert.equal(h.context.window.location.href, undefined);
    assert.equal(h.context.LocalAnnotations.isLocalMode(), true);
    h.state.confirms = true;
    h.node('catalog-mode').handlers.click();
    assert.equal(h.context.window.location.href, '/annotator.html');
  });
  await test('3D initialization and model-rendering errors do not prevent local upload or export', async () => {
    for (const options of [{ fail3DInit: true }, { fail3DModel: true }]) {
      const h = catalogHarness(options);
      h.state.ready[0](); h.state.ready[1]();
      for (const request of h.state.spotRequests) request.resolve({});
      await new Promise(resolve => setTimeout(resolve, 0));
      assert.ok(h.state.warnings.length > 0);
      await h.select('local-image-upload', photoFile());
      h.state.current = [copy(box)];
      h.context.LocalAnnotations.exportFile();
      assert.equal(JSON.parse(h.state.downloads[0].text).annotations[box.id].body[0].value, 'du₃');
      assert.equal(h.node('local-annotation-import').disabled, false);
    }
  });
  await test('pending and failed 3D surface requests do not delay or change local annotation', async () => {
    const h = catalogHarness(); h.state.ready[0](); h.state.ready[1]();
    assert.equal(h.state.spotRequests.length, 6);
    await h.select('local-image-upload', photoFile());
    const localViewer = h.context.viewer;
    h.state.current = [copy(box)]; h.state.events.createAnnotation();
    // 3D is still pending, but local import/export is usable.
    h.context.LocalAnnotations.exportFile();
    assert.equal(h.state.downloads.length, 1);
    for (const request of h.state.spotRequests) request.reject(new Error('3D network unavailable'));
    await new Promise(resolve => setTimeout(resolve, 0));
    assert.equal(h.context.viewer, localViewer);
    assert.deepEqual(h.state.current, [box]);
    await h.select('local-annotation-import', jsonFile(h.state.downloads[0].text));
    assert.equal(h.state.current[0].body[0].value, 'du₃');
  });
  await test('invalid upload leaves catalog mode, viewer, and navigation intact', async () => {
    const h = catalogHarness(); h.state.ready[0]();
    const catalogViewer = h.context.viewer;
    await h.select('local-image-upload', photoFile('renamed.png', [1, 2, 3]));
    assert.equal(h.context.viewer, catalogViewer);
    assert.equal(h.context.LocalAnnotations.isLocalMode(), false);
    assert.equal(h.node('images').disabled, false);
    assert.equal(h.node('images').selectizeDisabled, false);
    assert.equal(h.node('imageside').disabled, false);
    assert.equal(h.node('catalog-mode').hidden, true);
  });
  await test('shared catalog functions still work on layouts without the optional local module', () => {
    const h = catalogHarness();
    delete h.context.LocalAnnotations;
    assert.equal(h.context.isLocalPhotoActive(), false);
    assert.doesNotThrow(() => h.context.loadVariants());
    h.state.requests.find(r => r.url.includes('result%2F')).success({});
    for (const auth of h.state.auth) auth({ id: 'catalog-user', username: 'catalog-user' });
    assert.equal(h.state.authUpdates, 1);
  });
  await test('failed and timed-out catalog upload retains the live image, annotations, mode, and controls', async () => {
    for (const failure of ['open-failed', 'timeout']) {
      const h = catalogHarness(); attachCatalogSaving(h); h.state.ready[0]();
      h.context.anno.setAnnotations([box]); h.context.curanno = { [box.id]: copy(box) };
      const old = { viewer: h.context.viewer, anno: h.context.anno, annotations: h.context.curanno,
        host: h.node('openseadragon'), toolbar: h.node('my-toolbar-container'), indexes: h.context.curimgindex };
      h.node('savetransliteration').disabled = true; // Preserve an already-disabled catalog control too.
      h.state.holdNextOpen = true;
      const uploading = h.select('local-image-upload', photoFile());
      const failed = await waitForCandidate(h);
      const candidateAnno = h.state.editors.at(-1);
      assert.equal(h.context.viewer, old.viewer);
      assert.equal(old.viewer.destroyed, undefined);
      assert.equal(h.node('openseadragon'), old.host);
      assert.equal(h.context.LocalAnnotations.canSaveCatalog(), false, 'block saving during a pending upload');
      if (failure === 'timeout') {
        assert.equal(h.state.timers.size, 1);
        [...h.state.timers.values()][0]();
      } else failed.lateFailure();
      await uploading;
      assert.equal(h.context.viewer, old.viewer); assert.equal(h.context.anno, old.anno);
      assert.deepEqual(h.context.anno.getAnnotations(), [box]);
      assert.equal(h.context.curanno, old.annotations); assert.equal(h.context.curimgindex, old.indexes);
      assert.equal(h.context.LocalAnnotations.isLocalMode(), false);
      assert.equal(h.context.LocalAnnotations.canSaveCatalog(), true);
      assert.equal(h.node('openseadragon'), old.host); assert.equal(h.node('my-toolbar-container'), old.toolbar);
      assert.equal(old.viewer.destroyed, undefined); assert.equal(old.anno.destroyed, undefined);
      assert.equal(h.node('images').disabled, false); assert.equal(h.node('imageside').disabled, false);
      assert.equal(h.node('saveInGit3D').disabled, false);
      assert.equal(h.node('savetransliteration').disabled, true);
      assert.equal(h.node('catalog-mode').hidden, true);
      assert.equal(h.state.timers.size, 0);
      assert.equal(failed.destroyed, true); assert.equal(candidateAnno.destroyed, true);
      assert.equal(failed.handlers.open, undefined); assert.equal(failed.handlers['open-failed'], undefined);
      assert.equal(failed.element.isConnected, false);
      assert.equal([...h.state.nodes].filter(n => n.isConnected && n.id.includes('candidate-')).length, 0);
      assert.deepEqual(h.state.revocations, [failed.source.url]);
      // A queued event holding the old callback must also be harmless after cleanup.
      failed.lateOpen(); failed.lateFailure(); candidateAnno.events.createAnnotation();
      assert.equal(h.context.viewer, old.viewer); assert.equal(h.context.curanno, old.annotations);
      await h.context.commitData();
      assert.equal(h.state.writes.length, 1);
      assert.deepEqual(JSON.parse(h.state.writes[0].args[3]), old.annotations);
      // Retrying is usable, and obsolete callbacks cannot damage the next successful photo either.
      await h.select('local-image-upload', photoFile('retry.png'));
      const successful = h.context.viewer;
      failed.lateOpen(); failed.lateFailure();
      assert.equal(h.context.viewer, successful);
      assert.equal(old.viewer.destroyed, true);
    }
  });
  await test('failed and timed-out local replacement retains the old viewer, edited labels, boxes, and blob URL', async () => {
    for (const failure of ['open-failed', 'timeout']) {
      const h = browserHarness(); await h.select('local-image-upload', photoFile());
      const edited = copy(box); edited.body[0].value = 'corrected'; edited.target.selector.value = 'xywh=pixel:100,200,300,400';
      h.state.current = [edited]; h.state.events.updateAnnotation();
      const oldViewer = h.context.viewer, oldAnno = h.context.anno;
      const oldAnnotations = h.context.curanno, oldUrl = oldViewer.source.url;
      h.state.holdNextOpen = true;
      const uploading = h.select('local-image-upload', photoFile('replacement.png'));
      const failed = await waitForCandidate(h);
      if (failure === 'timeout') [...h.state.timers.values()][0](); else failed.lateFailure();
      await uploading;
      failed.lateOpen(); failed.lateFailure();
      assert.equal(h.context.viewer, oldViewer); assert.equal(h.context.anno, oldAnno);
      assert.equal(h.context.curanno, oldAnnotations); assert.deepEqual(h.state.current, [edited]);
      assert.equal(h.context.LocalAnnotations.isLocalMode(), true);
      assert.equal(h.node('local-annotation-import').disabled, false);
      assert.equal(h.node('saveAnnotations').disabled, false);
      assert.equal(h.node('saveInGit3D').disabled, true);
      assert.equal(h.state.timers.size, 0);
      assert.ok(!h.state.revocations.includes(oldUrl));
      assert.deepEqual(h.state.revocations, [failed.source.url]);
      h.context.LocalAnnotations.exportFile();
      const saved = JSON.parse(h.state.downloads[0].text).annotations[box.id];
      assert.equal(saved.body[0].value, 'corrected'); assert.equal(saved.target.selector.value, edited.target.selector.value);
    }
  });
  await test('local catalog save calls and wrappers issue zero repository writes even if controls are re-enabled', async () => {
    const h = catalogHarness(); attachCatalogSaving(h); h.state.ready[0]();
    await h.select('local-image-upload', photoFile());
    h.state.current = [copy(box)]; h.state.events.createAnnotation();
    for (const id of ['saveInGit3D', 'saveApprovals', 'savetransliteration', 'savetransliterationannotation']) {
      assert.equal(h.node(id).disabled, true);
      h.node(id).disabled = false; // Function-level guards must not depend on the button.
    }
    for (const action of [() => h.context.commitData(), () => h.context.commitTextAnnotationData(),
      () => h.context.saveTransliteration('HS_TEST', {}), () => h.context.commit3DBBOX(), () => h.context.saveApprovals(),
      () => h.context.saveTransliterationJSON(), () => h.context.saveAnnotations(),
      () => h.context.saveTransliterationAnnotationJSON()]) await action();
    assert.equal(h.state.writes.length, 0);
    assert.match(h.node('local-file-status').textContent, /Catalog saving is unavailable/);
    h.context.LocalAnnotations.exportFile(); assert.equal(h.state.downloads.length, 1);
  });
  await test('normal catalog create/edit saving works with and without the optional local module', async () => {
    for (const withoutModule of [false, true]) {
      const h = catalogHarness(); attachCatalogSaving(h); h.state.ready[0]();
      if (withoutModule) delete h.context.LocalAnnotations;
      const catalog = { [box.id]: copy(box) }; h.context.curanno = catalog;
      await h.context.commitData();
      assert.equal(h.state.writes[0].operation, 'create');
      assert.equal(h.state.writes[0].args[1], 'result/HS_TEST_front.png.json');
      assert.deepEqual(JSON.parse(h.state.writes[0].args[3]), catalog);
      assert.equal(h.node('saveInGit').disabled, false);
      h.state.rejectCreate = true;
      await h.context.commitData();
      assert.equal(h.state.writes.at(-1).operation, 'edit');
      assert.deepEqual(JSON.parse(h.state.writes.at(-1).args[3]), catalog);
      h.state.rejectCreate = false;
      await h.context.commitTextAnnotationData();
      await h.context.saveTransliteration('HS_TEST', {});
      await h.context.commit3DBBOX(); await h.context.saveApprovals();
      assert.equal(h.state.writes.length, 7);
    }
  });
  await test('a save started before uploading cannot retry with local annotations or re-enable catalog saving', async () => {
    for (const functionName of ['commitData', 'commitTextAnnotationData']) {
      const h = catalogHarness(); attachCatalogSaving(h); h.state.ready[0]();
      h.context.curanno = { [box.id]: copy(box) }; h.state.deferCreate = true;
      const saving = h.context[functionName]();
      assert.equal(h.state.writes.length, 1);
      await h.select('local-image-upload', photoFile());
      const local = { ...copy(box), id: '#local' }; h.state.current = [local]; h.state.events.createAnnotation();
      h.state.pendingCreate.reject(new Error('Create failed after upload')); await saving;
      assert.equal(h.state.writes.length, 1, 'no fallback write is allowed after entering local mode');
      assert.equal(JSON.parse(h.state.writes[0].args[3])[box.id].id, box.id);
      assert.equal(h.node('saveInGit3D').disabled, true);
    }
  });
  await test('catalog save entry points also issue zero writes while a replacement is still loading', async () => {
    const h = catalogHarness(); attachCatalogSaving(h); h.state.ready[0]();
    h.context.curanno = { [box.id]: copy(box) };
    h.state.holdNextOpen = true;
    const uploading = h.select('local-image-upload', photoFile());
    const candidate = await waitForCandidate(h);
    assert.equal(h.context.LocalAnnotations.isLocalMode(), false);
    await h.context.commitData(); await h.context.commitTextAnnotationData();
    await h.context.saveTransliteration('HS_TEST', {}); await h.context.commit3DBBOX(); await h.context.saveApprovals();
    assert.equal(h.state.writes.length, 0);
    candidate.lateFailure(); await uploading;
    assert.equal(h.node('saveInGit3D').disabled, false);
    await h.context.commitData(); assert.equal(h.state.writes.length, 1);
  });
  await test('catalog retries use the captured catalog payload rather than changed global annotations', async () => {
    for (const functionName of ['commitData', 'commitTextAnnotationData']) {
      const h = catalogHarness(); attachCatalogSaving(h); h.state.ready[0]();
      const original = { [box.id]: copy(box) };
      h.context.curanno = original; h.state.deferCreate = true;
      const saving = h.context[functionName]();
      h.context.curanno = { '#other': { ...copy(box), id: '#other' } };
      h.state.pendingCreate.reject(new Error('Retry required')); await saving;
      assert.equal(h.state.writes.length, 2);
      assert.equal(h.state.writes[1].operation, 'edit');
      assert.deepEqual(JSON.parse(h.state.writes[1].args[3]), original);
    }
  });
  await test('a catalog save finishing during a failed upload leaves its Save control usable', async () => {
    const h = catalogHarness(); attachCatalogSaving(h); h.state.ready[0]();
    h.context.curanno = { [box.id]: copy(box) }; h.state.deferCreate = true;
    const saving = h.context.commitData();
    h.state.holdNextOpen = true;
    const uploading = h.select('local-image-upload', photoFile());
    const candidate = await waitForCandidate(h);
    h.state.pendingCreate.resolve({}); await saving;
    assert.equal(h.node('saveInGit').disabled, true, 'keep the control disabled during loading');
    candidate.lateFailure(); await uploading;
    assert.equal(h.node('saveInGit').disabled, false);
    assert.equal(h.context.LocalAnnotations.canSaveCatalog(), true);
  });
  return { passed: passed.length, tests: passed };
}
module.exports = run;
if (require.main === module) run().then(result => console.log(JSON.stringify(result, null, 2))).catch(error => {
  console.error(error); process.exitCode = 1;
});
