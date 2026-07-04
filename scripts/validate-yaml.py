#!/usr/bin/env python3
"""
YAML validation script for events.yaml
Validates syntax, structure, and data consistency.
"""

import yaml
import sys
import os
from datetime import datetime
from pathlib import Path

def validate_yaml_syntax(file_path):
    """Validate YAML syntax."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            yaml.safe_load(f)
        print(f"✅ YAML syntax is valid: {file_path}")
        return True
    except yaml.YAMLError as e:
        print(f"❌ YAML syntax error in {file_path}:")
        print(f"   {e}")
        return False
    except Exception as e:
        print(f"❌ Error reading {file_path}: {e}")
        return False

def validate_event_structure(events):
    """Validate the structure of each event."""
    required_fields = ['title', 'date', 'description']
    optional_fields = ['tags', 'organizations', 'models', 'impact_areas', 'key_figures', 'link', 'layoff_ids']
    
    errors = []
    
    for i, event in enumerate(events):
        # Check required fields
        for field in required_fields:
            if field not in event:
                errors.append(f"Event {i+1} ('{event.get('title', 'Unknown')}'): Missing required field '{field}'")
        
        # Check field types
        if 'tags' in event and not isinstance(event['tags'], list):
            errors.append(f"Event {i+1} ('{event.get('title', 'Unknown')}'): 'tags' must be a list")
        
        if 'organizations' in event and not isinstance(event['organizations'], list):
            errors.append(f"Event {i+1} ('{event.get('title', 'Unknown')}'): 'organizations' must be a list")
        
        if 'models' in event and not isinstance(event['models'], list):
            errors.append(f"Event {i+1} ('{event.get('title', 'Unknown')}'): 'models' must be a list")
        
        if 'impact_areas' in event and not isinstance(event['impact_areas'], list):
            errors.append(f"Event {i+1} ('{event.get('title', 'Unknown')}'): 'impact_areas' must be a list")
        
        if 'key_figures' in event and not isinstance(event['key_figures'], list):
            errors.append(f"Event {i+1} ('{event.get('title', 'Unknown')}'): 'key_figures' must be a list")

        # Layoff data lives in data/layoffs/layoffs.csv; events reference rows by id
        if 'layoffs' in event:
            errors.append(f"Event {i+1} ('{event.get('title', 'Unknown')}'): nested 'layoffs' blocks are retired - add the row to data/layoffs/layoffs.csv and reference it via 'layoff_ids'")
        if 'layoff_ids' in event:
            ids = event['layoff_ids']
            if not isinstance(ids, list) or not all(isinstance(x, str) for x in ids):
                errors.append(f"Event {i+1} ('{event.get('title', 'Unknown')}'): 'layoff_ids' must be a list of strings")

        # Validate date format
        if 'date' in event:
            try:
                datetime.fromisoformat(event['date'].replace('Z', '+00:00'))
            except ValueError:
                errors.append(f"Event {i+1} ('{event.get('title', 'Unknown')}'): Invalid date format '{event['date']}'")
    
    return errors

def validate_layoff_references(events):
    """Every layoff_ids entry must reference a real row in data/layoffs/layoffs.csv."""
    import csv

    errors = []
    dataset_path = Path('data/layoffs/layoffs.csv')
    if not dataset_path.exists():
        if any('layoff_ids' in e for e in events):
            errors.append(f"layoff_ids used but {dataset_path} not found")
        return errors

    with open(dataset_path, newline='', encoding='utf-8') as f:
        known_ids = {row['id'] for row in csv.DictReader(f)}

    for i, event in enumerate(events):
        for lid in event.get('layoff_ids', []) or []:
            if lid not in known_ids:
                errors.append(f"Event {i+1} ('{event.get('title', 'Unknown')}'): layoff_ids references unknown id '{lid}'")
    return errors

def validate_data_consistency(events):
    """Validate data consistency across events."""
    errors = []
    
    # Check for duplicate titles
    titles = [event.get('title', '') for event in events]
    duplicates = [title for title in set(titles) if titles.count(title) > 1]
    if duplicates:
        errors.append(f"Duplicate titles found: {', '.join(duplicates)}")
    
    # Check for empty arrays that should have content
    for i, event in enumerate(events):
        if 'organizations' in event and event['organizations'] == []:
            errors.append(f"Event {i+1} ('{event.get('title', 'Unknown')}'): 'organizations' is empty - consider removing if not applicable")
        
        if 'models' in event and event['models'] == []:
            errors.append(f"Event {i+1} ('{event.get('title', 'Unknown')}'): 'models' is empty - consider removing if not applicable")
    
    return errors

def main():
    """Main validation function."""
    file_path = Path('data/events.yaml')
    
    if not file_path.exists():
        print(f"❌ File not found: {file_path}")
        sys.exit(1)
    
    print(f"🔍 Validating {file_path}...")
    
    # Step 1: Validate YAML syntax
    if not validate_yaml_syntax(file_path):
        sys.exit(1)
    
    # Step 2: Load and validate structure
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            events = yaml.safe_load(f)
        
        if not isinstance(events, list):
            print("❌ Root element must be a list of events")
            sys.exit(1)
        
        print(f"✅ Found {len(events)} events")
        
    except Exception as e:
        print(f"❌ Error loading events: {e}")
        sys.exit(1)
    
    # Step 3: Validate event structure
    structure_errors = validate_event_structure(events)
    if structure_errors:
        print("❌ Structure validation errors:")
        for error in structure_errors:
            print(f"   {error}")
        sys.exit(1)
    else:
        print("✅ Event structure is valid")
    
    # Step 4: Validate layoff dataset references
    reference_errors = validate_layoff_references(events)
    if reference_errors:
        print("❌ Layoff reference errors:")
        for error in reference_errors:
            print(f"   {error}")
        sys.exit(1)
    else:
        print("✅ Layoff dataset references are valid")

    # Step 5: Validate data consistency
    consistency_errors = validate_data_consistency(events)
    if consistency_errors:
        print("⚠️  Data consistency warnings:")
        for error in consistency_errors:
            print(f"   {error}")
        # Don't exit for warnings, just warn
    else:
        print("✅ Data consistency is good")
    
    print("🎉 All validations passed!")
    return True

if __name__ == '__main__':
    main() 