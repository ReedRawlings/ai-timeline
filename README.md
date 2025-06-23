

## 🧠 Project Summary: AI Timeline Website

**Goal**: A public website that displays a chronological timeline of important AI developments, with tags, filters, and optional admin editing via a CMS.

---

## 🔧 Tech Stack

* **Static Site Generator**: Hugo
* **Hosting**: GitHub Pages (via GitHub Actions)
* **Theme**: Ananke (or custom minimalist timeline theme)
* **Content Format**: Markdown (`/content/events/*.md`)
* **CMS**: Netlify CMS (optional, gated to owner)
* **CI/CD**: GitHub Actions builds site and deploys to `gh-pages` branch

---

## 🗂️ Features

* Timeline of AI events with:

  * Date
  * Title
  * Tags (e.g., “Research”, “Model”, “Product”, "Social")
  * Related Models (Chatgpt, Gemini, Claude)
  * Related Organizations (Google, Microsoft, OpenAI, Anthropic)
  * External link
* Events stored as individual Markdown files
* Tags filterable client-side (via JS or Hugo taxonomy)
* Year/month navigation
* CMS interface for easy content updates (Netlify CMS)
* Fully responsive layout (mobile-friendly)

---

## 🚀 Workflow

1. **Write events** as Markdown files in `content/events/`
2. **Push to GitHub** (branch: `main`)
3. **GitHub Actions** runs `hugo --minify` and deploys to GitHub Pages
4. **Site updates instantly**
5. (Optional) Edit via **Netlify CMS** at `/admin/`, access-controlled via Netlify Identity

---

## 🛠️ What Needs to Be Built/Configured

* Hugo site initialized with working theme
* GitHub Actions workflow for Hugo → GitHub Pages
* CMS config in `static/admin/config.yml`
* Sample content to validate layout
* Optional: Filtering JS for tags + year nav

