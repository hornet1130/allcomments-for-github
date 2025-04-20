# AllComments for GitHub

Automatically expand all hidden comments on GitHub issue pages.

![Screenshot](./assets/main.png) <!-- 필요시 확장 소개 이미지 추가 -->

## 📌 What is it?

**AllComments for GitHub** is a Chrome extension that automatically clicks all "Load more" and "Show more replies" buttons on GitHub issue pages, so you can see the full conversation without needing to manually expand each thread.

Whether you're browsing a long open source thread or reviewing internal discussions on GitHub Enterprise, this tool saves time and ensures you never miss any hidden comments.

---

## ✨ Features

- ✅ Automatically expands all hidden comments on GitHub issues
- ✅ Floating "Show all comments" button in the bottom-right corner
- ✅ Smart retry system with configurable intervals and attempt limits
- ✅ Fully customizable:
  - Allowed domains (e.g., github.com, git.company.com)
  - Reload interval and max retry attempts
  - Button label matching via regex
  - Hidden item indicator detection via regex
- ✅ Designed to run **only** on issue pages you allow (default: `github.com`)
- ✅ No external scripts, no remote code — privacy-respecting and secure

---

## ⚙️ Options

You can configure the extension by:

1. Clicking the extension icon in your browser toolbar
2. Adjusting settings like:
   - Allowed domains
   - Reload interval (500–3000ms)
   - Max attempts (1–20)
   - Regex patterns for load buttons and hidden comment indicators

> `github.com` is always enforced as a default domain and cannot be removed.

---

## 🔒 Permissions & Safety

While the extension requests `<all_urls>` host permission, it:

- Enforces domain restrictions via user-defined allowlist at runtime
- Only activates on GitHub issue pages (e.g. `/owner/repo/issues/123`)
- Includes strict validations and safeguards to prevent misuse
- Uses no remote code, eval, or dynamic imports

---

## 🚀 Installation

1. Download or clone this repository
2. Run `yarn build` or `npm run build`
3. Go to `chrome://extensions`
4. Enable "Developer mode"
5. Click “Load unpacked” and select the `dist/` folder

---

## 📄 License

[MIT](LICENSE)

---

## 🛠 Tech Stack

- Manifest v3
- Vanilla JS
- `esbuild` for bundling
- Chrome `storage.sync` for settings

---

## 📬 Feedback or Contributions

Feel free to submit issues or pull requests. This project is lightweight by design, but suggestions are welcome!
