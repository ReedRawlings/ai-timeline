# AI Timeline - Setup Guide

This guide will help you set up and run the AI Timeline website locally, and deploy it to GitHub Pages.

## Prerequisites

- Git installed on your system
- A GitHub account
- Hugo installed (see installation instructions below)

## Installing Hugo

### macOS
```bash
# Using Homebrew (recommended)
brew install hugo

# Or download from GitHub
curl -L https://github.com/gohugoio/hugo/releases/latest/download/hugo_extended_macOS-64bit.tar.gz | tar -xz
sudo mv hugo /usr/local/bin/
```

### Windows
```bash
# Using Chocolatey
choco install hugo-extended

# Or download from GitHub and add to PATH
```

### Linux
```bash
# Using package manager
sudo apt-get install hugo  # Ubuntu/Debian
sudo dnf install hugo      # Fedora

# Or download from GitHub
```

## Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-timeline.git
   cd ai-timeline
   ```

2. **Run Hugo locally**
   ```bash
   hugo server -D
   ```

3. **View the site**
   Open your browser and go to `http://localhost:1313`

   The `-D` flag includes draft content. Remove it to exclude drafts.

## Adding New Events

### Method 1: Using Hugo CLI
```bash
hugo new events/event-name.md
```

This will create a new file in `content/events/` with the proper front matter structure.

### Method 2: Manual Creation
Create a new `.md` file in `content/events/` with this structure:

```yaml
---
title: "Event Title"
date: 2024-01-01
draft: false
tags: ["Tag1", "Tag2"]
organizations: ["Organization Name"]
models: ["Model Name"]
categories: ["Category"]
external_link: "https://example.com"
description: "Brief description of the event"
image: ""
weight: 0
---

## Event Details

Detailed description of the event...

## Impact

What was the significance...

## Related Links

- [Link 1](https://example.com)
- [Link 2](https://example.com)
```

## Deployment to GitHub Pages

### Automatic Deployment (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add new content"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Navigate to Settings > Pages
   - Select "GitHub Actions" as the source
   - The workflow will automatically build and deploy your site

### Manual Deployment

1. **Build the site**
   ```bash
   hugo --minify
   ```

2. **Deploy to GitHub Pages**
   ```bash
   # Create a new branch for deployment
   git checkout -b gh-pages
   
   # Copy built files
   cp -r public/* .
   
   # Commit and push
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin gh-pages
   ```

## Content Management with Netlify CMS

### Setup Netlify CMS

1. **Enable Netlify Identity**
   - Go to your Netlify dashboard
   - Navigate to Site settings > Identity
   - Click "Enable Identity"

2. **Configure Git Gateway**
   - In the Identity section, go to Services > Git Gateway
   - Click "Enable Git Gateway"

3. **Invite Users**
   - Go to the Identity tab
   - Click "Invite users" to add content editors

### Access the CMS

- Visit `https://yoursite.netlify.app/admin/`
- Sign in with your Netlify Identity credentials
- Start creating and editing content

## Customization

### Styling
- Edit `static/css/main.css` to modify the appearance
- The site uses a modern, responsive design with CSS Grid and Flexbox

### Layout
- Modify templates in `layouts/` directory
- `layouts/index.html` - Homepage timeline
- `layouts/_default/single.html` - Individual event pages
- `layouts/_default/baseof.html` - Base template

### Configuration
- Edit `config.toml` to change site settings
- Update the `baseURL` to match your GitHub Pages URL
- Modify menus, taxonomies, and other Hugo settings

## Troubleshooting

### Common Issues

1. **Hugo not found**
   - Ensure Hugo is installed and in your PATH
   - Try `hugo version` to verify installation

2. **Build errors**
   - Check for syntax errors in Markdown files
   - Verify front matter is properly formatted
   - Look for missing required fields

3. **GitHub Pages not updating**
   - Check GitHub Actions for build errors
   - Verify the workflow file is in `.github/workflows/`
   - Ensure the repository has Pages enabled

4. **Netlify CMS not working**
   - Verify Netlify Identity is enabled
   - Check Git Gateway configuration
   - Ensure proper permissions are set

### Getting Help

- Check the [Hugo documentation](https://gohugo.io/documentation/)
- Review [GitHub Pages documentation](https://pages.github.com/)
- Consult [Netlify CMS docs](https://www.netlifycms.org/docs/)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `hugo server`
5. Submit a pull request

## License

This project is open source. See the LICENSE file for details. 