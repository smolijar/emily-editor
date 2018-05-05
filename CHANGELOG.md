# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Added
- Gulp

### Changed
- Browser resources are bundled and one CSS and one JS is required

### Fixed
- Dist folder is created before deployed, not after install

## [0.7.7] - 2018-04-16
### Fixed
- Generate dist in postinstall

## [0.7.3] - 2018-04-16
### Fixed
- Eslint not finding dist folder

## [0.7.2] - 2018-04-16
### Fixed
- Transpiled before publish
- Unecessary relative path reaching deep into src

## [0.7.1] - 2018-04-14
### Changed
- Seperate demo from index (for imports)

## [0.7.0] - 2018-03-17
### Added
- Add mode bootstrapper
- Symbol based language generation
- Asciidoc basic tests
- jsdom
- Autosave tests
- Mode specific header filtering
- Reference autocomplete
- Attribute/variable autocomplete
- File listing suggestions
- Cheerio
- Travis npm release

### Changed
- Use asciidoctor-html5s instead of default backend
- Regex not used for working with headers, line-ninja and html render used insetead.
- applyOnDom now uses jsdom and is isomorphic
- `toHtml` replaced by `convert`, which might produce additional document information (suggestions for now)
- All dom parsing done through ugly ass cheerio instead of heavy jsdom with elegant interface

### Removed
- Language prop defaults (due to mode bootstrap)
- jsdom

### Fixed
- #73 (Fix console errors)
- Use inherit font in outline
- Nested buttons DOM validation
- Fix block selection error (from export refactor)
- Allow `modue.exports` exporting in babel
- jsdom isomorphic usage
- #27 (Autosave key)
- #28 (Localstorage cleanup)
- Mismatch server/client in dangerous html due to client only modifications
- Asciidoc _discrete_ headings are hidden from outline
- #90 (Autocomplete for document elements)
- #91 (Autocomplete available files)

## [0.6.0] - 2018-03-02
### Added
- Title tooltips for statusbar and outline
- Show shortcuts for commands in palette
- Command kbd bindings
- Basic text formatting commands
- Embedding examples
- Dimension props
- AsciiDoc module

### Changed
- Refactor command palette props
- Move timeouts out of state
- Open command pallette is now a command as well
- Use Pure components instead of Components
- Replace module's getToHtml with toHtml
- Refactor header finding
- Use ES6 export syntax
- Use arrow functions instead of autobinding function

### Removed
- scrollguard (lastScrolled) from state
- Ugly-ass timeout waiting for Ace to propagate scrolling into config layer
- Proportional font sizes (deprecated from CM) option
- react-autobind

### Fixed
- Unable to close Command palette through editor focus
- #59 (Command palette selected keyboard and mouse)
- #57 (Missing CSS while draggin in outline)
- Dragging delay (not needed when using handles)
- Markdown heading pattern
- #50 (Jumping beginnig/end does not synchronize scroll)
- Manually update Ace on scroll to have valid value in callback
- #34 (Swapping sections resets editor scroll)
- Inconsistent and confusing commands behavior and names
- Embedding when container has % dimension
- #12 (Replace regex matching in Outline generation)
- Selection expanding on block formatting
- #56 (Fix move-section handle icon symbol missing on some platforms)
- #67 (Truncated toggle arrow)
- False header regex findings crashing when destructure
- Update next, webpack and jest
- Missing glob module (Heroku deploy error)
- Missing module `/dist/pages/_document.js` (Heroku runtime error)

## [0.5.0] - 2017-12-12
### Removed
- CDN Roboto
- Old editor props
- Unecessary document quries in command palette component

### Changed
- Simplify statusbar content
- Accent command palette button
- Use same fonts in editor components
- Hybrid ugly-ass dark theme to light
- Show scrollbars
- Make drag handles visible only on hover
- Make oultine visually cleaner and sections more distinguishable

### Fixed
- Fixed synchronized scrolling with wrapped text
- Text dragging to work on handle only
- Command palette mouse interaction

## [0.4.0] - 2017-12-08
### Added
- Ace editor
- Toggle whitespace display

### Changed
- Simplify line lookup (limit to preview only)
- Extract editor initialization

### Removed
- CodeMirror
- Spellchecking
- Proportional font sizes

### Fixed
- Add keys to generated columns
- Scrolling issues (#32)
- Outline lookup scroll on top (#20)

## [0.3.1] - 2017-11-30
### Fixed
- autosave not retrieving properly
- Scrollbar hiding cross browser (fix #36, #32)
- Toggle column visibility via CSS, not conditional rendernig (fix #35)

## [0.3.0] - 2017-11-28
### Added
- Section reordering tests
- Lightweight markup mock language _dot_ for testing
- Simple markdown mode tests
- ESlint code quality settings
- `react-autobind`
- autosave feature
- Typo.js
- lodash
- XHR mock in jest
- English spellcheck
- Autocorrect suggestions

### Changed
- Outline styles to feel more spacey-ish
- Thinner editor border
- Broaden outline column

### Removed
- Draggable delay in outline
- CodeMirror for tests (will use only state/textarea)

### Fixed
- Section reordering for edge sections
- Code quality following new eslint rules

## [0.2.0] - 2017-11-07
### Added
- Editor simple test
- Simplify outline generation
- Helpers test
- Dummy test
- `jest` and `enzyme`
- babelrc
- Travis test task
- Next 4
- React 16
- Esling babel
- Build npm script
- Lint as npm script
- Travis configuration
- Codemirror
- HTML rendering timeout (not immidiate anymore)
- Markdown preview GitHub style
- Markdown preview abbr
- Markdown preview deflist
- Markdown preview sub, sup, ins
- Markdown preview mark
- Markdown preview footnotes
- Markdown preview emoji
- Markdown preview code highlight
- Heroku postbuild script
- npm start script
- Reordering sections in outline feature
- Outline appearance
- Fullscreen mode
- Cursor postition statusbar
- Airbnb coding style
- Local demo markdown document
- Proportional font sizes option
- Enlarge editor demo size
- Multiple addons with more or less basic configuration
- Src line no hiding in html
- Scrolling synchronization for both columns
- Scrolling onScroll event
- Statusbar

### Changed
- Created hub and test CSR (instead of just SSR)
- Editor moved to `src`
- Extracted commands from editor
- Scroll sync (effect stays same, rewritten due to cm auto height issue)
- Use markdown-it instead of marked
- Markdown mode seperated
- Port is accepted from env
- Scattered helper functions are in seperate file
- Outline as component is in seperate file
- Fixed editor size to fluid parent
- Language specific func. is provided as prop
- Make more scrolling breakpoints
- Scrolling sync. using lang. specific function
- Scrolling synchronization

### Removed
- React 15
- Next 3
- Unused props and state attrs
- Heroku-postbuild npm script
- react-codemirror
- marked dependency
- Cursor position hiding in html

### Fixed
- Messy binding order
- LineNinja replication
- Propagation of cm option changes
- Outline generation handling
- CursorActivity handling
- Scroll event cb fired onChange performance issue
- Cursor activity performance issue
- CodeMirror auto size performance issue
- Markdown lineSafeInsert
- Demo initalProps SSR domain independent
- Outline lookup with duplicate header source codes
- Proportional font sizes
- Scroll sync. in both columns

## [0.1.0] - 2017-10-16
### Added
- Readme
- Add sizing to state
- Launch command palette on Ctrl+P
- Command palette
- Outline seek on click
- Outline column
- Smooth scrolling
- Auto-scroll preview when editor cursor changed
- Basic toolbar controls
- Two column layout
- Live html rendered preview column
- CodeMirror editor

[Unreleased]: https://github.com/grissius/markup-editor/compare/v0.7.7...HEAD
[0.7.7]: https://github.com/grissius/markup-editor/compare/v0.7.6...v0.7.7
[0.7.6]: https://github.com/grissius/markup-editor/compare/v0.7.5...v0.7.6
[0.7.5]: https://github.com/grissius/markup-editor/compare/v0.7.4...v0.7.5
[0.7.4]: https://github.com/grissius/markup-editor/compare/v0.7.3...v0.7.4
[0.7.3]: https://github.com/grissius/markup-editor/compare/v0.7.2...v0.7.3
[0.7.2]: https://github.com/grissius/markup-editor/compare/v0.7.1...v0.7.2
[0.7.1]: https://github.com/grissius/markup-editor/compare/v0.7.0...v0.7.1
[0.7.0]: https://github.com/grissius/markup-editor/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/grissius/markup-editor/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/grissius/markup-editor/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/grissius/markup-editor/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/grissius/markup-editor/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/grissius/markup-editor/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/grissius/markup-editor/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/grissius/markup-editor/compare/36fe7b8...v0.1.0
