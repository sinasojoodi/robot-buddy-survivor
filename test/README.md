# Testing Documentation

This directory contains comprehensive tests for the Robot Buddy Survivor React game.

## Test Structure

```
test/
├── setup.js                     # Jest configuration and global mocks
├── components/                  # Component-specific tests
│   └── game.test.jsx           # Main game component tests
├── utils/                      # Utility and logic tests
│   └── gameLogic.test.js       # Game configuration and logic tests
├── integration/                # Full workflow integration tests
│   └── gameIntegration.test.jsx # End-to-end game flow tests
└── README.md                   # This file
```

## Test Categories

### Component Tests (`test/components/`)
- **game.test.jsx**: Tests for the main `RobotBuddySurvivor` component
  - Initial rendering and UI elements
  - Game state management (start/stop/pause)
  - Inventory system functionality
  - Keyboard controls and interactions
  - Canvas interaction and mouse events
  - Robot buddy system
  - Component lifecycle and cleanup

### Utility Tests (`test/utils/`)
- **gameLogic.test.js**: Tests for game constants and utility functions
  - Game configuration validation
  - Block types and properties
  - Level requirements and progression
  - Enemy types and stats
  - Collision detection algorithms
  - Game state calculations
  - Resource management logic

### Integration Tests (`test/integration/`)
- **gameIntegration.test.jsx**: End-to-end workflow tests
  - Complete game startup flow
  - Keyboard controls integration
  - Crafting system workflows
  - Canvas rendering and interactions
  - Error handling and edge cases
  - Performance and optimization

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (automatically re-run tests on file changes)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## Test Configuration

### Jest Configuration (`jest.config.js`)
- **Environment**: jsdom (for DOM testing)
- **Setup**: Automatic import of testing utilities
- **Mocks**: Canvas API, requestAnimationFrame, and CSS modules
- **Coverage**: Tracks coverage for all source files except main.jsx

### Babel Configuration (`babel.config.js`)
- **Presets**: env and react for JSX transformation
- **Target**: Current Node.js version for testing

### Setup File (`test/setup.js`)
- **Global Mocks**: Canvas methods, animation frame, matchMedia
- **Testing Library**: jest-dom matchers for enhanced assertions
- **Test Utilities**: Helper functions for consistent testing

## Mock Objects

The test setup includes comprehensive mocks for:

### Canvas API
- All 2D context methods (fillRect, drawImage, etc.)
- Text measurement and rendering
- Path operations and transformations

### Browser APIs
- `requestAnimationFrame` / `cancelAnimationFrame`
- `window.matchMedia` for responsive design
- Keyboard and mouse event handling

### Custom Utilities
- `createMockKeyboardEvent()`: Helper for keyboard event testing

## Writing New Tests

### Component Tests
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import YourComponent from '../../src/components/YourComponent.jsx';

describe('YourComponent', () => {
  test('renders correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Utility Tests
```javascript
import { yourUtilityFunction } from '../../src/utils/yourUtility.js';

describe('yourUtilityFunction', () => {
  test('handles input correctly', () => {
    expect(yourUtilityFunction(input)).toBe(expectedOutput);
  });
});
```

## Continuous Integration

These tests are designed to run in CI/CD environments:
- All tests are deterministic and don't rely on timing
- Mocks prevent external dependencies
- Coverage reports can be generated for code quality metrics

## Coverage Goals

- **Components**: Aim for >80% coverage on critical game logic
- **Utilities**: Aim for >90% coverage on pure functions
- **Integration**: Cover all major user workflows

## Best Practices

1. **Isolation**: Each test should be independent
2. **Clarity**: Test names should describe the expected behavior
3. **Mocking**: Mock external dependencies but test real logic
4. **Performance**: Keep tests fast by avoiding unnecessary async operations
5. **Maintenance**: Update tests when functionality changes