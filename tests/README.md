# Test Suite Documentation

This directory contains all tests for the Chord and Keys application, organized by type and functionality.

## Test Structure

```
tests/
├── unit/           # Unit tests for individual functions and modules
├── integration/    # Integration tests for component interactions
├── e2e/           # End-to-end tests for full user workflows
├── visualization/  # Visual tests for UI components and rendering
└── README.md      # This file
```

## Test Types

### Unit Tests (`unit/`)
- **Purpose**: Test individual functions and modules in isolation
- **Files**: 
  - `chords.test.js` - Tests chord theory functions
  - `notes.test.js` - Tests note manipulation functions
  - `scales.test.js` - Tests scale theory functions
- **Run with**: `npm test` (from project root)

### Visualization Tests (`visualization/`)
- **Purpose**: Test UI components, canvas rendering, and visual interactions
- **Files**:
  - `test-visualizations.html` - Main visualization test suite
  - `test_piano_highlighting_and_minimap.html` - Piano keyboard and minimap tests
  - `test_right_click_functionality.html` - Context menu and interaction tests
  - `test_transport_controls.html` - Audio transport control tests
  - `test_visualizations.html` - General visualization tests
  - `test_irrational_ts.html` - Time signature tests
- **Run with**: Open in browser directly

### Integration Tests (`integration/`)
- **Purpose**: Test component interactions and data flow
- **Status**: Ready for future test development
- **Run with**: `npm run test:integration` (when implemented)

### End-to-End Tests (`e2e/`)
- **Purpose**: Test complete user workflows and scenarios
- **Status**: Ready for future test development
- **Run with**: `npm run test:e2e` (when implemented)

## Running Tests

### Unit Tests
```bash
# From project root
npm test

# Or run specific test files
node tests/unit/chords.test.js
node tests/unit/notes.test.js
node tests/unit/scales.test.js
```

### Visualization Tests
```bash
# Open in browser (from project root)
# These are HTML files that can be opened directly in any browser
open tests/visualization/test-visualizations.html
open tests/visualization/test_piano_highlighting_and_minimap.html
# etc.
```

### All Tests
```bash
# Run unit tests
npm test

# Open visualization tests in browser
# (Manual process - open each HTML file)
```

## Test Development Guidelines

### Unit Tests
- Use descriptive test names
- Test both success and failure cases
- Keep tests focused and isolated
- Use meaningful assertions

### Visualization Tests
- Include visual feedback for test results
- Test both appearance and interaction
- Provide clear instructions for manual verification
- Use consistent styling and layout

### Integration Tests
- Test component interactions
- Verify data flow between modules
- Test error handling across boundaries
- Focus on user workflows

### E2E Tests
- Test complete user journeys
- Verify application behavior from user perspective
- Test cross-browser compatibility
- Include performance benchmarks

## Test Maintenance

### Adding New Tests
1. Choose appropriate test type based on what you're testing
2. Follow existing naming conventions
3. Update this README if adding new test categories
4. Ensure tests are self-contained and don't depend on external state

### Updating Tests
1. Update tests when changing functionality
2. Maintain backward compatibility when possible
3. Document breaking changes in test behavior
4. Keep test data and fixtures up to date

### Debugging Tests
1. Check console output for errors
2. Verify test environment setup
3. Ensure dependencies are installed
4. Check for timing issues in async tests

## Test Environment

### Requirements
- Node.js (for unit tests)
- Modern web browser (for visualization tests)
- Tone.js (for audio-related tests)

### Setup
```bash
# Install dependencies
npm install

# Verify test environment
npm test
```

## Contributing

When adding new tests:
1. Follow the existing structure and conventions
2. Update this README with new test information
3. Ensure tests are comprehensive and well-documented
4. Test both positive and negative scenarios
5. Include clear error messages and debugging information
