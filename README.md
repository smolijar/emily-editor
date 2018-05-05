![Emily](https://i.imgur.com/WxZEIli.png)

[![Travis build](https://travis-ci.org/grissius/emily-editor.svg?branch=master)](https://travis-ci.org/grissius/emily-editor)
[![Dependencies Status](https://david-dm.org/grissius/emily-editor/status.svg)](https://david-dm.org/grissius/emily-editor)
[![Dev-dependencies Status](https://david-dm.org/grissius/emily-editor/dev-status.svg)](https://david-dm.org/grissius/emily-editor?type=dev)
[![npm version](https://badge.fury.io/js/emily-editor.svg)](https://www.npmjs.com/package/emily-editor/)

Emily is a React editor component for [LML](https://en.wikipedia.org/wiki/Lightweight_markup_language)s, like Markdown or Asciidoc.
The focus of the project is to provide fluent efficient interface for advanced users, who are familliar with using IDE or coding text editors.

# About Emily

Emily is an editor for LML document formats, currently supporting few languages.
Editor works with a document-format abstraction and new modules can be added to make use of existing features:

- Syntax highlight
    - Emily uses [Ace](https://ace.c9.io/) editor under the hood, see [supported languages](https://docs.c9.io/docs/supported-languages)
- Live document preview
    - Review the result as you type in split screen view or just browse the preview
- Outline preview
    - Section lookup in source code
    - Section reordering -- drag & drop whole sections
- Command palette
    - Make use of a command palette you know from coding editors
- Autosave
    - Session is stored in localStorage, retrieved when lost.

Emily editor is part of an implementation for the [Git-based Wiki System](https://github.com/grissius/gitwiki-thesis) and its UI for the prototype has been [developed](https://github.com/grissius/markup-editor-ui) in cource _UI Design_ on the faculty.

# Install

```
npm install --save emily-editor
```

# Usage

1. Include `node_modules/emily-editor/dist/style.css`
2. Include `node_modules/emily-editor/dist/script.js`
3. Use component:

```js
import Emily from 'emily-editor'
// ...

ReactDOM.render(
  <Emily />,
  document.getElementById('container')
);
```

For examples, see [pages](./pages)

## Props

### `content`
Initial content of the editor

### `language`
Language mode object.
You can use [`generateMode`](#-generatemode-) to create a mode from existing modules.

```js
import Emily, { generateMode } from 'emily-editor'
// ...

ReactDOM.render(
  <Emily language={generateMode(/*...*/)} />,
  document.getElementById('container')
);
```

### `listFiles(pfx)`
List available relative files with path prefix `pfx`.
Returns a `Array<String>` in a Promise.

This can be used for autosuggestions by a mode.

### `width`
Lock editor's width and vorbid it to fill the container.

### `height`
Lock editor's height and vorbid it to fill the container.

## Methods

### `getValue`
Return current value of the editor.

## `generateMode(input)`

Input can be either:

 - name of the mode, e.g. `asciidoc`
 - any file path, e.g. `foo/bar/baz.adoc`

As a result a language mode is generated.

1. If the name or the extension matches an existing LML mode, a proper full-featured mode is generated.
2. If the name or the extension matches a mode supported by Ace editor, no special features for LML are provided, but editor features syntax highlight.
3. Otherwise a plaintext editor is delivered. No syntax highlight.

### Examples
Here are some examples of using the editor with `generateMode` function.
```js
// asciidoc mode
<Emily language={generateMode('x.adoc')}>
<Emily language={generateMode('asciidoc')}>
<Emily language={generateMode('/xxx/weee.adoc')}>

// markdown mode
<Emily language={generateMode('markdown')}>
<Emily language={generateMode('a/b/c/d/foo.md')}>

// (unsupported) js mode
// only syntax highlight, missing features
<Emily language={generateMode('javascript')}>
<Emily language={generateMode('test.js')}>

// unrecognized mode
// working in plaintext mode
<Emily language={generateMode('foo/bar/baz')}>
<Emily language={generateMode('thisisnotanameofanymode')}>
```

## Language modes
Take a look at [asciidoc mode](./src/modes/asciidoc.js) example.

`name` (string)
- name of the mode

`convert` (func)
- converting function to html from the raw markup

`lineSafeInsert` (func)
- insert content in the line of markup without distorting the markup
- the more lines you can cover the better
- it is necessary to cover heading lines

`postProcess` (func)
- modify preview DOM before render

`renderJsxStyle` (func)
- add styles for preview

`excludeOutlineItem` (func)
- exclude DOM Element from the outline

`previewClassName` (string)
- set the CSS classname for the prevew container


# Online demo

https://emily-editor.herokuapp.com/


# License

Emily editor is licenced under the [BSD License](./LICENSE).