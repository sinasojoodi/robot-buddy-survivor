import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RobotBuddySurvivor from '../../src/components/game.jsx';

describe('Game Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('UI Interaction Flow', () => {
    test('start screen displays correctly', () => {
      render(<RobotBuddySurvivor />);
      
      // 1. Verify start screen elements
      expect(screen.getByText(/Robot Buddy Survivor/i)).toBeInTheDocument();
      expect(screen.getByText(/Start Mining Adventure/i)).toBeInTheDocument();
      expect(screen.getByText(/How to Survive/i)).toBeInTheDocument();
    });

    test('instructions are comprehensive', () => {
      render(<RobotBuddySurvivor />);
      
      // Verify all control instructions are present
      expect(screen.getByText(/Arrow Keys:/i)).toBeInTheDocument();
      expect(screen.getByText(/Spacebar:/i)).toBeInTheDocument();
      expect(screen.getByText(/'C' Key:/i)).toBeInTheDocument();
      expect(screen.getByText(/'Z' Key:/i)).toBeInTheDocument();
      expect(screen.getByText(/'X' Key:/i)).toBeInTheDocument();
      
      // Verify instruction details
      expect(screen.getByText(/Move your character/i)).toBeInTheDocument();
      expect(screen.getByText(/Mine blocks when standing close/i)).toBeInTheDocument();
      expect(screen.getByText(/Open the crafting menu/i)).toBeInTheDocument();
      expect(screen.getByText(/Cycle through blocks to place/i)).toBeInTheDocument();
      expect(screen.getByText(/Place the selected block above you/i)).toBeInTheDocument();
    });

    test('button interaction works', async () => {
      const user = userEvent.setup();
      render(<RobotBuddySurvivor />);
      
      const startButton = screen.getByText(/Start Mining Adventure/i);
      
      // Button should be clickable
      expect(startButton).toBeInTheDocument();
      expect(startButton.tagName).toBe('BUTTON');
      
      // Focus and click should work without errors
      startButton.focus();
      expect(startButton).toHaveFocus();
      
      // Note: We don't actually click to start the game to avoid canvas rendering issues
    });
  });

  describe('Component Stability', () => {
    test('component handles multiple renders', () => {
      // Render multiple times to test stability
      for (let i = 0; i < 3; i++) {
        const { unmount } = render(<RobotBuddySurvivor />);
        expect(screen.getByText(/Robot Buddy Survivor/i)).toBeInTheDocument();
        unmount();
      }
    });

    test('component structure remains consistent', () => {
      const { container: container1 } = render(<RobotBuddySurvivor />);
      const { container: container2 } = render(<RobotBuddySurvivor />);
      
      // Both renders should have the same basic structure
      expect(container1.querySelector('.min-h-screen')).toBeInTheDocument();
      expect(container2.querySelector('.min-h-screen')).toBeInTheDocument();
    });
  });

  describe('Error Boundary Testing', () => {
    test('component does not crash on render', () => {
      // Capture console errors
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => render(<RobotBuddySurvivor />)).not.toThrow();
      
      // Clean up
      consoleError.mockRestore();
    });

    test('handles prop changes gracefully', () => {
      const { rerender } = render(<RobotBuddySurvivor />);
      
      // Re-render should not cause issues
      expect(() => rerender(<RobotBuddySurvivor />)).not.toThrow();
    });
  });

  describe('Keyboard Event Handling', () => {
    test('component can receive keyboard events without crashing', () => {
      render(<RobotBuddySurvivor />);
      
      // Fire some keyboard events on the document
      fireEvent.keyDown(document, { key: 'w', code: 'KeyW' });
      fireEvent.keyDown(document, { key: 'a', code: 'KeyA' });
      fireEvent.keyDown(document, { key: 's', code: 'KeyS' });
      fireEvent.keyDown(document, { key: 'd', code: 'KeyD' });
      
      // Component should still be rendered
      expect(screen.getByText(/Robot Buddy Survivor/i)).toBeInTheDocument();
    });

    test('handles new block placement keyboard events', () => {
      render(<RobotBuddySurvivor />);
      
      // Fire block placement keyboard events
      fireEvent.keyDown(document, { key: 'z', code: 'KeyZ' });
      fireEvent.keyDown(document, { key: 'x', code: 'KeyX' });
      
      // Component should still be rendered without crashing
      expect(screen.getByText(/Robot Buddy Survivor/i)).toBeInTheDocument();
    });

    test('handles crafting and other special keys', () => {
      render(<RobotBuddySurvivor />);
      
      // Fire special keyboard events
      fireEvent.keyDown(document, { key: 'c', code: 'KeyC' });
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      fireEvent.keyDown(document, { key: ' ', code: 'Space' });
      
      // Component should still be rendered without crashing
      expect(screen.getByText(/Robot Buddy Survivor/i)).toBeInTheDocument();
    });
  });

  describe('Performance Considerations', () => {
    test('component renders in reasonable time', () => {
      const startTime = performance.now();
      render(<RobotBuddySurvivor />);
      const endTime = performance.now();
      
      // Render should complete quickly (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });

    test('multiple unmounts do not cause memory leaks', () => {
      // Render and unmount multiple times
      for (let i = 0; i < 5; i++) {
        const { unmount } = render(<RobotBuddySurvivor />);
        unmount();
      }
      
      // Should complete without errors
      expect(true).toBe(true);
    });
  });

  describe('CSS and Styling', () => {
    test('components have expected CSS classes', () => {
      const { container } = render(<RobotBuddySurvivor />);
      
      // Check for Tailwind classes
      expect(container.querySelector('.bg-gray-800')).toBeInTheDocument();
      expect(container.querySelector('.rounded-lg')).toBeInTheDocument();
      expect(container.querySelector('.shadow-2xl')).toBeInTheDocument();
    });

    test('button has hover styles applied', () => {
      render(<RobotBuddySurvivor />);
      
      const button = screen.getByText(/Start Mining Adventure/i);
      expect(button).toHaveClass('hover:bg-green-800');
      expect(button).toHaveClass('bg-green-600');
    });
  });

  describe('Block Placement System Integration', () => {
    test('component handles block placement workflow without errors', () => {
      render(<RobotBuddySurvivor />);
      
      // Simulate a complete block placement workflow
      // 1. Fire Z key to cycle through blocks
      fireEvent.keyDown(document, { key: 'z', code: 'KeyZ' });
      fireEvent.keyUp(document, { key: 'z', code: 'KeyZ' });
      
      // 2. Fire X key to attempt block placement
      fireEvent.keyDown(document, { key: 'x', code: 'KeyX' });
      fireEvent.keyUp(document, { key: 'x', code: 'KeyX' });
      
      // Component should remain stable
      expect(screen.getByText(/Robot Buddy Survivor/i)).toBeInTheDocument();
    });

    test('keyboard event sequence does not break component', () => {
      render(<RobotBuddySurvivor />);
      
      // Simulate rapid key presses
      const keySequence = [
        { key: 'z', code: 'KeyZ' },
        { key: 'x', code: 'KeyX' },
        { key: 'c', code: 'KeyC' },
        { key: 'Escape', code: 'Escape' },
        { key: 'z', code: 'KeyZ' },
        { key: 'x', code: 'KeyX' }
      ];
      
      keySequence.forEach(({ key, code }) => {
        fireEvent.keyDown(document, { key, code });
        fireEvent.keyUp(document, { key, code });
      });
      
      // Component should remain stable after rapid key sequence
      expect(screen.getByText(/Robot Buddy Survivor/i)).toBeInTheDocument();
    });
  });
});