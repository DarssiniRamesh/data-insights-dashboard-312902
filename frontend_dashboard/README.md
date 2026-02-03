# Data Insights Dashboard - Frontend

React-based frontend for the Data Product Publishing system.

## Overview

Modern, clean UI for managing data assets (formerly "submissions") with:
- **Standardized data asset metadata**: title, description, owner
- Data asset creation and tracking
- Validation status monitoring
- Approval workflows with e-signatures
- Audit trail access
- Dashboard analytics

## Terminology

**Data Asset**: The standard term for a versioned data product package with standardized metadata. Previously called "submission".

**Metadata Fields** (standardized):
- `title`: Required, 1-200 characters
- `description`: Optional, max 2000 characters
- `owner`: Required, 1-120 characters

## Pages

### Dashboard (`/`)
- View tracked data assets
- Check status and validation state
- Remove tracked assets
- Terminology note displayed for clarity

### Data Assets (Submissions) (`/submissions`)
- Create new data assets via compatibility endpoint
- Form includes:
  - Title (Name): Required, 1-200 chars with character counter
  - Description: Optional, max 2000 chars with counter
  - Version: Required
  - Artifact URIs: Required
  - Domain metadata: Optional (GxP flag)
- Field validation enforces metadata constraints
- Help text explains data asset metadata standards

### Validation (`/validation`)
- Trigger validation runs for data assets
- View validation reports
- Check quality gate status

### Approvals (`/approvals`)
- Approve or reject data assets
- Electronic signature support
- SoD enforcement (UI warns about self-approval)

### Publish (`/publish`)
- Publish approved data assets
- View publication status

## API Integration

### Data Assets API (New)
```javascript
import { dataAssetsApi } from "./api/endpoints";

// Create data asset with standardized metadata
const result = await dataAssetsApi.create(draftId, {
  title: "My Data Asset",
  description: "Optional description",
  owner: "user@example.com"
}, currentUser);

// Get data asset
const dataAsset = await dataAssetsApi.get(dataAssetId);

// Trigger validation
await dataAssetsApi.triggerValidation(dataAssetId, { validation_profile: "baseline" }, currentUser);

// Approve
await dataAssetsApi.approve(dataAssetId, {
  decision: "publish",
  rationale: "Meets all requirements",
  password: "userPassword",
  signature_reason: "Approval of data asset"
}, currentUser);
```

### Submissions API (Deprecated - Backward Compatibility)
```javascript
import { submissionsApi } from "./api/endpoints";

// Legacy compatibility endpoint
const result = await submissionsApi.createCompat({
  name: "Product Data",
  version: "1.0.0",
  description: "Q1 2024 data",
  artifacts: [{ uri: "s3://bucket/file.csv" }]
});
```

## Environment Variables

Create a `.env` file:
```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_SITE_URL=http://localhost:3000
```

## Running

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Theme

**Pure White** theme with:
- Primary: #374151 (gray-700)
- Secondary: #9CA3AF (gray-400)
- Success: #10B981 (emerald-500)
- Error: #EF4444 (red-500)
- Background: #f9fafb (gray-50)
- Surface: #ffffff (white)
- Text: #111827 (gray-900)

Minimalist style with clean layouts and professional appearance.

## Layout

Sidebar navigation with main content area:
- Dashboard (home)
- Data Assets (Submissions)
- Validation
- Approvals
- Publish
- Audit (if auditor role)

## Components

### ErrorBanner
Displays validation and API errors

### Forms
- Standardized field labels
- Character counters for length-constrained fields
- Inline validation
- Help text with metadata constraints

### Tables
- Data asset listing
- Validation status
- Audit events

## Migration Guide

### For Developers

**Old (Deprecated)**:
```javascript
const result = await submissionsApi.createCompat({
  name: "Data Product",
  version: "1.0.0"
});
```

**New (Standardized)**:
```javascript
const result = await dataAssetsApi.create(draftId, {
  title: "Data Product",
  description: "Description of the data asset",
  owner: currentUser.email
}, currentUser);
```

### Key Changes

1. **Terminology**: "Submission" → "Data Asset"
2. **Metadata**: Standardized to `title`, `description`, `owner`
3. **API Endpoints**: `/api/v1/data-assets` (new) vs `/api/v1/submissions` (deprecated)
4. **Form Fields**: Character limits enforced, help text added
5. **Validation**: Frontend validates metadata constraints before submission

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- SubmissionsPage.test.js
```

## Accessibility

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Focus management
- Error announcements

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

## Contributing

When adding new features:
1. Use standardized "data asset" terminology
2. Enforce metadata constraints (title, description, owner)
3. Add character counters for length-limited fields
4. Include help text explaining constraints
5. Update this README with new pages/components
