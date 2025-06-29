# Data Management Options for AI Timeline

This document outlines different approaches to managing your timeline events data, along with their pros and cons.

## Current Approach: Individual Markdown Files

**Structure:** Each event is a separate markdown file in `content/events/`

**Pros:**
- Hugo's native content management approach
- Easy to create individual event pages
- Good for SEO (each event can have its own URL)
- Familiar to Hugo users

**Cons:**
- Harder to manage as the number of events grows
- Difficult to make bulk changes
- No easy way to see all events at once
- Version control becomes messy with many small files

## Recommended Approach: Single YAML Data File

**Structure:** All events in `data/events.yaml`

**Pros:**
- **Easy to manage:** All events in one place
- **Bulk operations:** Easy to add, edit, or remove multiple events
- **Better version control:** Single file to track changes
- **Data validation:** Easier to ensure consistency
- **Import/Export:** Simple to convert to/from other formats
- **Collaboration:** Easier for multiple people to work on
- **Analytics:** Easy to analyze trends across all events

**Cons:**
- No individual event pages (unless you generate them)
- Less SEO-friendly for individual events
- Requires template changes

## Alternative Approaches

### 1. JSON Data File
Similar to YAML but using JSON format. Good if you prefer JSON or need to integrate with JavaScript-heavy workflows.

### 2. CSV/Excel Import
Store data in a spreadsheet and import it. Great for non-technical users to edit data.

### 3. Database Integration
Use a database (SQLite, PostgreSQL) for very large datasets. Overkill for most timeline projects.

### 4. Hybrid Approach
Keep individual markdown files for major events (with full pages) and use YAML for smaller events.

## Migration Guide

### Option 1: Use the Migration Script

1. Run the migration script:
   ```bash
   python migrate-to-yaml.py
   ```

2. Review the generated `data/events.yaml` file

3. Test your site:
   ```bash
   hugo server
   ```

4. If everything looks good, you can delete the individual markdown files

### Option 2: Manual Migration

1. Create `data/events.yaml` with your events
2. Update your Hugo templates to use `.Site.Data.events`
3. Test and iterate

## Template Changes Required

The main changes needed in your templates:

1. **Data source:** Change from `.Site.RegularPages` to `.Site.Data.events`
2. **Field access:** Change from `.Params.field` to `.field`
3. **Date handling:** Use `time .date` instead of `.Date`

## Adding New Events

With the YAML approach, adding new events is simple:

```yaml
- title: "New AI Model Release"
  date: "2024-01-15T10:00:00-07:00"
  tags: ["Model", "Product"]
  organizations: ["Company Name"]
  models: ["Model Name"]
  link: "https://example.com"
  description: "Description of the event..."
```

## Data Validation

Consider adding validation to ensure data quality:

- Required fields (title, date, description)
- Date format consistency
- Tag/organization naming consistency
- Link validation

## Future Considerations

As your timeline grows, consider:

1. **Categorization:** Add more structured categories
2. **Rich media:** Support for images, videos, or other media
3. **Geographic data:** Add location information
4. **Impact metrics:** Add quantitative impact measures
5. **Sources:** Add multiple source links per event

## Recommendation

For most timeline projects, the **single YAML data file approach** is the best choice. It provides the best balance of manageability, flexibility, and simplicity.

The migration script provided will help you transition smoothly from your current markdown-based approach to the YAML data file approach. 