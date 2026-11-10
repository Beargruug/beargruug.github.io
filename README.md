# beargru.ug

A personal website that looks like Neovim. Plain HTML, CSS and JS, with no build step: open `index.html` in a browser.

## Where to change what

| I want to…                              | File              |
| --------------------------------------- | ----------------- |
| add a project or a boot.dev milestone   | `js/data.js`      |
| edit the text of about.md, contact.md … | `js/buffers.js`   |
| add an `:command`                       | `js/commands.js`  |
| add a key mapping                       | `js/keys.js`      |
| change colors or layout                 | `css/style.css`   |

Everything else is in `js/` and named after what it does (`telescope.js`, `harpoon.js`, `typing-test.js`, …).

## How the scripts fit together

- The files are plain `<script>` tags that share one global scope. They are not ES modules.
- `index.html` loads them in order. A file can only use another file's code *at load time* if that file comes earlier in the list.
- Calling another file's functions from inside a function is always fine.
- `main.js` starts the app, so it must stay last.

## Buffer markup

Buffer lines use a small markup that `js/markup.js` turns into HTML:

- `{cls|text}` styles the text with the CSS class `t-cls`, for example `{h|# Title}` or `{c|-- comment}`
- `{a:url|text}` is a link, and `{A:url|text}` is a string-styled link
- `{a:buf:about.md|text}` opens another buffer
