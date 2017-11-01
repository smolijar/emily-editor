# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Added
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
 - Port is accepted from env
 - Scattered helper functions are in seperate file
 - Outline as component is in seperate file
 - Fixed editor size to fluid parent
 - Language specific func. is provided as prop
 - Make more scrolling breakpoints
 - Scrolling sync. using lang. specific function
 - Scrolling synchronization

### Removed
 - Cursor position hiding in html

### Fixed
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

[Unreleased]: https://github.com/grissius/markup-editor/compare/dev...master
[0.1.0]: v0.0.0..v0.1.0
