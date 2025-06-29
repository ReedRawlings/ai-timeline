#!/bin/bash

# Test YAML validation locally
# This script can be run before committing to catch errors early

echo "🔍 Testing YAML validation..."

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed"
    exit 1
fi

# Check if PyYAML is installed
if ! python3 -c "import yaml" &> /dev/null; then
    echo "📦 Installing PyYAML..."
    pip3 install PyYAML
fi

# Run validation
python3 scripts/validate-yaml.py

if [ $? -eq 0 ]; then
    echo "✅ Validation passed! Safe to commit."
else
    echo "❌ Validation failed! Please fix the errors before committing."
    exit 1
fi 