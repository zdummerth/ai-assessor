#!/bin/bash

# Script to regenerate TypeScript database types after running migrations
# Run this after applying new migrations to update the generated types

echo "Regenerating database types..."
echo ""
echo "This will update database-types.ts with the latest schema from Supabase."
echo ""

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null
then
    echo "Error: Supabase CLI is not installed."
    echo "Install it with: npm install -g supabase"
    exit 1
fi

# Generate types
npx supabase gen types typescript --local > database-types.ts

echo ""
echo "✓ Database types updated successfully!"
echo ""
echo "Note: Type errors in neighborhood-summaries actions will now be resolved."
