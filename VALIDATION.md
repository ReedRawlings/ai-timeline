# YAML Validation System

This document describes the YAML validation system that ensures your `data/events.yaml` file is properly formatted and consistent.

## Overview

The validation system checks:
- ✅ **YAML Syntax** - Valid YAML format
- ✅ **Event Structure** - Required fields and correct data types
- ✅ **Data Consistency** - No duplicates, proper formatting
- ⚠️ **Best Practices** - Warnings for potential improvements

## Validation Levels

### 1. **Critical Errors** (Will break deployment)
- Invalid YAML syntax
- Missing required fields (`title`, `date`, `description`)
- Incorrect data types (arrays vs strings)
- Invalid date formats

### 2. **Warnings** (Will not break deployment)
- Empty arrays that could be removed
- Duplicate event titles
- Inconsistent formatting

## Running Validation

### **Local Development**
```bash
# Run validation manually
python scripts/validate-yaml.py

# Or use the test script
./scripts/test-validation.sh
```

### **Pre-commit Hook** (Automatic)
The validation runs automatically before each commit if `data/events.yaml` has been modified.

### **GitHub Actions** (Automatic)
Validation runs automatically in the CI/CD pipeline before building the site.

## Required Fields

Each event must have these fields:

```yaml
- title: "Event Title"           # Required: string
  date: "2024-01-15T10:00:00Z"  # Required: ISO 8601 format
  description: "Event description" # Required: string
  tags: ["Tag1", "Tag2"]        # Optional: array of strings
  organizations: ["Org1"]       # Optional: array of strings
  models: ["Model1"]            # Optional: array of strings
  impact_areas: ["Area1"]       # Optional: array of strings
  key_figures: ["Person1"]      # Optional: array of strings
  link: "https://example.com"   # Optional: string
```

## Date Format

Dates must be in ISO 8601 format:
```yaml
# ✅ Valid formats
date: "2024-01-15T10:00:00-07:00"  # With timezone
date: "2024-01-15T10:00:00Z"       # UTC
date: "2024-01-15T10:00:00"        # Local time

# ❌ Invalid formats
date: "2024-01-15"                 # Missing time
date: "Jan 15, 2024"               # Non-ISO format
```

## Common Issues & Solutions

### **Trailing Commas**
```yaml
# ❌ Invalid
impact_areas: ["Area1", "Area2", ]

# ✅ Valid
impact_areas: ["Area1", "Area2"]
```

### **Incorrect Indentation**
```yaml
# ❌ Invalid - wrong indentation
  - title: "Event Title"

# ✅ Valid - proper indentation
- title: "Event Title"
```

### **Empty Arrays**
```yaml
# ⚠️ Warning - consider removing if not needed
organizations: []
models: []

# ✅ Better - omit the field entirely
# (organizations and models fields not included)
```

## Validation Script Details

The validation script (`scripts/validate-yaml.py`) performs these checks:

1. **Syntax Validation**
   - Valid YAML format
   - Proper indentation
   - No syntax errors

2. **Structure Validation**
   - Required fields present
   - Correct data types
   - Valid date formats

3. **Consistency Validation**
   - No duplicate titles
   - Consistent formatting
   - Best practices

## Troubleshooting

### **Validation Fails Locally**
1. Check the error message for specific issues
2. Fix the YAML syntax errors
3. Run validation again: `python scripts/validate-yaml.py`

### **Validation Fails in CI/CD**
1. Check the GitHub Actions logs
2. Fix the issues locally
3. Commit and push the fixes

### **Pre-commit Hook Not Working**
1. Ensure the hook is executable: `chmod +x .git/hooks/pre-commit`
2. Check that Python and PyYAML are installed
3. Run manually: `python scripts/validate-yaml.py`

## Best Practices

1. **Test Locally First** - Always run validation before committing
2. **Use Consistent Formatting** - Follow the established patterns
3. **Remove Empty Fields** - Don't include empty arrays unless needed
4. **Validate Dates** - Use proper ISO 8601 format
5. **Check for Duplicates** - Ensure unique event titles

## Adding New Validation Rules

To add new validation rules, edit `scripts/validate-yaml.py`:

```python
def validate_custom_rule(events):
    """Add your custom validation logic here."""
    errors = []
    for i, event in enumerate(events):
        # Your validation logic
        if some_condition:
            errors.append(f"Event {i+1}: Custom error message")
    return errors
```

Then add it to the main validation function. 