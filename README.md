# 🧠 AI Timeline Website

**Goal**: A public website that displays a chronological timeline of AI developments, with tags, filters, and optional admin editing via a CMS.

**Live Site**: [https://ReedR.github.io/ai-timeline/](https://ReedR.github.io/ai-timeline/)

---

## ✅ Completed Features

### 🏗️ Core Infrastructure
- **Static Site Generator**: Hugo configured and running
- **Hosting**: GitHub Pages with GitHub Actions CI/CD pipeline
- **Custom Theme**: `ai-timeline-theme` with horizontal scroll layout
- **Content Structure**: Markdown-based events in `/content/events/`

### 🎨 Timeline Implementation
- **Horizontal Scroll Layout**: Timeline displays events in chronological order
- **Time Grouping**: Events grouped by month and year with labeled headers
- **Event Cards**: Compact cards showing event name and date
- **Stacking System**: Multiple events on same day stack vertically to prevent overlap
- **Interactive Cards**: Hover/touch to expand with full details
- **Responsive Design**: Mobile-friendly with touch interactions

### 📝 Content Management
- **Event Structure**: Each event includes:
  - Date and title
  - Tags (Model, Product, Social, etc.)
  - Related Models (ChatGPT, GPT-4, Claude, etc.)
  - Related Organizations (OpenAI, Google, Microsoft, etc.)
  - External links
- **Sample Events**: 4 AI events already created:
  - ChatGPT Release (Nov 2022)
  - GPT-4 Release (Mar 2023)
  - Claude Release (Mar 2023)
  - GPT-4o Release (May 2024)

### 🔧 Technical Features
- **Taxonomies**: Tags, organizations, models, and categories
- **SEO**: Sitemap, RSS feeds, meta descriptions
- **Accessibility**: Keyboard navigation, ARIA labels, focus management
- **Performance**: Minified CSS/JS, optimized builds
- **Auto-deployment**: Push to main branch triggers GitHub Actions build

---

## 🚧 In Progress / Planned Features

### 🔍 Filtering & Navigation
- [ ] Client-side tag filtering
- [ ] Year/month navigation controls
- [ ] Search functionality
- [ ] Filter by organization or model

### 📊 Enhanced Timeline
- [ ] Timeline zoom controls
- [ ] Decade/century view options
- [ ] Event clustering for dense periods
- [ ] Timeline navigation arrows

### 🎛️ Admin Interface
- [ ] Netlify CMS integration
- [ ] Content editing interface
- [ ] Access control via Netlify Identity
- [ ] Image upload support

### 📱 Additional Features
- [ ] Event sharing functionality
- [ ] Export timeline data
- [ ] Dark mode toggle
- [ ] Timeline comparison views

---

## 🚀 Development Workflow

1. **Add Events**: Create new Markdown files in `content/events/`
2. **Local Development**: Run `hugo server` for live preview
3. **Push Changes**: Commit to `main` branch
4. **Auto-Deploy**: GitHub Actions builds and deploys to GitHub Pages
5. **Live Updates**: Site updates automatically within minutes

### Local Development
```bash
# Clone the repository
git clone https://github.com/ReedR/ai-timeline.git
cd ai-timeline

# Start local development server
hugo server -D

# Build for production
hugo --minify
```

---

## 📁 Project Structure

```
ai-timeline/
├── content/events/          # Event markdown files
├── themes/ai-timeline-theme/ # Custom theme
│   ├── layouts/index.html   # Main timeline template
│   ├── static/css/main.css  # Timeline styling
│   └── static/js/main.js    # Interactive features
├── .github/workflows/       # CI/CD pipeline
├── config.toml             # Hugo configuration
└── public/                 # Generated site (auto-created)
```

---

## 🎯 Next Steps

1. **Add more AI events** to build out the timeline
2. **Implement filtering system** for better navigation
3. **Add Netlify CMS** for easier content management


---

## 🤝 Contributing

This project is open for contributions! Feel free to:
- Add new AI events to the timeline
- Improve the design and user experience
- Add new features and functionality
- Report bugs or suggest improvements

---

**Tech Stack**: Hugo, GitHub Pages, GitHub Actions, Custom CSS/JS


