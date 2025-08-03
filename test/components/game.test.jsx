import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RobotBuddySurvivor from '../../src/components/game.jsx';

describe('RobotBuddySurvivor Game Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    test('renders start screen with game title and start button', () => {
      render(<RobotBuddySurvivor />);
      
      expect(screen.getByText(/Robot Buddy Survivor/i)).toBeInTheDocument();
      expect(screen.getByText(/Start Mining Adventure/i)).toBeInTheDocument();
    });

    test('renders instructions on start screen', () => {
      render(<RobotBuddySurvivor />);
      
      expect(screen.getByText(/Arrow Keys:/i)).toBeInTheDocument();
      expect(screen.getByText(/Spacebar:/i)).toBeInTheDocument();
      expect(screen.getByText(/How to Survive/i)).toBeInTheDocument();
    });

    test('renders start button with proper styling', () => {
      render(<RobotBuddySurvivor />);
      
      const startButton = screen.getByText(/Start Mining Adventure/i);
      expect(startButton).toBeInTheDocument();
      expect(startButton.tagName).toBe('BUTTON');
    });
  });

  describe('Game Instructions', () => {
    test('displays all control instructions', () => {
      render(<RobotBuddySurvivor />);
      
      expect(screen.getByText(/Arrow Keys:/i)).toBeInTheDocument();
      expect(screen.getByText(/Spacebar:/i)).toBeInTheDocument();
      expect(screen.getByText(/'C' Key:/i)).toBeInTheDocument();
      expect(screen.getByText(/'Z' Key:/i)).toBeInTheDocument();
      expect(screen.getByText(/'X' Key:/i)).toBeInTheDocument();
    });

    test('displays instruction details', () => {
      render(<RobotBuddySurvivor />);
      
      expect(screen.getByText(/Move your character/i)).toBeInTheDocument();
      expect(screen.getByText(/Mine blocks when standing close/i)).toBeInTheDocument();
      expect(screen.getByText(/Open the crafting menu/i)).toBeInTheDocument();
      expect(screen.getByText(/Cycle through blocks to place/i)).toBeInTheDocument();
      expect(screen.getByText(/Place the selected block above you/i)).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    test('renders main container with proper structure', () => {
      const { container } = render(<RobotBuddySurvivor />);
      
      // Check for main container
      const mainContainer = container.querySelector('div');
      expect(mainContainer).toBeInTheDocument();
    });

    test('renders title with emoji icons', () => {
      render(<RobotBuddySurvivor />);
      
      const title = screen.getByText(/🤖 Robot Buddy Survivor ⚔️/i);
      expect(title).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('start button is focusable', () => {
      render(<RobotBuddySurvivor />);
      
      const startButton = screen.getByText(/Start Mining Adventure/i);
      startButton.focus();
      expect(startButton).toHaveFocus();
    });
  });

  describe('Component Lifecycle', () => {
    test('component mounts without errors', () => {
      expect(() => render(<RobotBuddySurvivor />)).not.toThrow();
    });

    test('component unmounts without errors', () => {
      const { unmount } = render(<RobotBuddySurvivor />);
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Responsive Design', () => {
    test('renders with responsive classes', () => {
      const { container } = render(<RobotBuddySurvivor />);
      
      // Check for responsive container classes
      const responsiveContainer = container.querySelector('.min-h-screen');
      expect(responsiveContainer).toBeInTheDocument();
    });
  });
});