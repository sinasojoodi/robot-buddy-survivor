import { 
  GAME_CONFIG, 
  BLOCK_TYPES, 
  LEVEL_REQUIREMENTS, 
  ENEMY_TYPES 
} from '../../src/components/game.jsx';

describe('Game Configuration', () => {
  describe('GAME_CONFIG', () => {
    test('has valid dimensions and speeds', () => {
      expect(GAME_CONFIG.width).toBe(800);
      expect(GAME_CONFIG.height).toBe(600);
      expect(GAME_CONFIG.blockSize).toBe(32);
      expect(GAME_CONFIG.playerSpeed).toBeGreaterThan(0);
      expect(GAME_CONFIG.robotSpeed).toBeGreaterThan(0);
    });

    test('has valid attack and mining ranges', () => {
      expect(GAME_CONFIG.attackRange).toBeGreaterThan(0);
      expect(GAME_CONFIG.robotAttackRange).toBeGreaterThan(0);
      expect(GAME_CONFIG.miningRange).toBeGreaterThan(0);
    });
  });

  describe('BLOCK_TYPES', () => {
    test('all block types have required properties', () => {
      Object.entries(BLOCK_TYPES).forEach(([blockName, blockData]) => {
        expect(blockData).toHaveProperty('color');
        expect(blockData).toHaveProperty('breakable');
        expect(blockData).toHaveProperty('hardness');
        expect(blockData).toHaveProperty('drops');
        expect(typeof blockData.color).toBe('string');
        expect(typeof blockData.breakable).toBe('boolean');
        expect(typeof blockData.hardness).toBe('number');
        expect(Array.isArray(blockData.drops)).toBe(true);
      });
    });

    test('hardness values are logical', () => {
      expect(BLOCK_TYPES.GRASS.hardness).toBeLessThan(BLOCK_TYPES.STONE.hardness);
      expect(BLOCK_TYPES.STONE.hardness).toBeLessThan(BLOCK_TYPES.IRON_ORE.hardness);
      expect(BLOCK_TYPES.IRON_ORE.hardness).toBeLessThan(BLOCK_TYPES.DIAMOND_ORE.hardness);
      expect(BLOCK_TYPES.DIAMOND_ORE.hardness).toBeLessThan(BLOCK_TYPES.OBSIDIAN.hardness);
    });

    test('all blocks have valid hex colors', () => {
      Object.values(BLOCK_TYPES).forEach(block => {
        expect(block.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });
  });

  describe('LEVEL_REQUIREMENTS', () => {
    test('level requirements increase progressively', () => {
      const levels = Object.keys(LEVEL_REQUIREMENTS).map(Number).sort((a, b) => a - b);
      
      for (let i = 1; i < levels.length; i++) {
        const prevLevel = levels[i - 1];
        const currentLevel = levels[i];
        expect(LEVEL_REQUIREMENTS[currentLevel]).toBeGreaterThan(LEVEL_REQUIREMENTS[prevLevel]);
      }
    });

    test('has requirements for levels 1-10', () => {
      for (let i = 1; i <= 10; i++) {
        expect(LEVEL_REQUIREMENTS).toHaveProperty(i.toString());
        expect(LEVEL_REQUIREMENTS[i]).toBeGreaterThan(0);
      }
    });
  });

  describe('ENEMY_TYPES', () => {
    test('all enemy types have required properties', () => {
      Object.entries(ENEMY_TYPES).forEach(([enemyName, enemyData]) => {
        expect(enemyData).toHaveProperty('color');
        expect(enemyData).toHaveProperty('health');
        expect(enemyData).toHaveProperty('damage');
        expect(enemyData).toHaveProperty('speed');
        expect(enemyData).toHaveProperty('size');
        expect(enemyData).toHaveProperty('armor');
        
        expect(typeof enemyData.color).toBe('string');
        expect(typeof enemyData.health).toBe('number');
        expect(typeof enemyData.damage).toBe('number');
        expect(typeof enemyData.speed).toBe('number');
        expect(typeof enemyData.size).toBe('number');
        expect(typeof enemyData.armor).toBe('number');
      });
    });

    test('enemy stats are positive numbers', () => {
      Object.values(ENEMY_TYPES).forEach(enemy => {
        expect(enemy.health).toBeGreaterThan(0);
        expect(enemy.damage).toBeGreaterThan(0);
        expect(enemy.speed).toBeGreaterThan(0);
        expect(enemy.size).toBeGreaterThan(0);
        expect(enemy.armor).toBeGreaterThanOrEqual(0);
      });
    });

    test('enemy colors are valid hex codes', () => {
      Object.values(ENEMY_TYPES).forEach(enemy => {
        expect(enemy.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });
  });
});

// Mock collision detection functions
describe('Game Logic Utilities', () => {
  describe('Collision Detection', () => {
    test('calculateDistance function logic', () => {
      const calculateDistance = (x1, y1, x2, y2) => {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      };

      expect(calculateDistance(0, 0, 3, 4)).toBe(5);
      expect(calculateDistance(0, 0, 0, 0)).toBe(0);
      expect(calculateDistance(1, 1, 1, 1)).toBe(0);
      expect(calculateDistance(-1, -1, 1, 1)).toBeCloseTo(2.828, 2);
    });

    test('isInRange function logic', () => {
      const isInRange = (x1, y1, x2, y2, range) => {
        const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        return distance <= range;
      };

      expect(isInRange(0, 0, 3, 4, 5)).toBe(true);
      expect(isInRange(0, 0, 3, 4, 4)).toBe(false);
      expect(isInRange(0, 0, 0, 0, 1)).toBe(true);
    });

    test('rectangular collision detection', () => {
      const checkCollision = (rect1, rect2) => {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
      };

      const rect1 = { x: 0, y: 0, width: 10, height: 10 };
      const rect2 = { x: 5, y: 5, width: 10, height: 10 };
      const rect3 = { x: 20, y: 20, width: 10, height: 10 };

      expect(checkCollision(rect1, rect2)).toBe(true);
      expect(checkCollision(rect1, rect3)).toBe(false);
    });
  });

  describe('Game State Calculations', () => {
    test('health percentage calculation', () => {
      const getHealthPercentage = (currentHealth, maxHealth) => {
        return Math.max(0, Math.min(100, (currentHealth / maxHealth) * 100));
      };

      expect(getHealthPercentage(50, 100)).toBe(50);
      expect(getHealthPercentage(0, 100)).toBe(0);
      expect(getHealthPercentage(100, 100)).toBe(100);
      expect(getHealthPercentage(150, 100)).toBe(100);
      expect(getHealthPercentage(-10, 100)).toBe(0);
    });

    test('level progression calculation', () => {
      const getNextLevelRequirement = (level) => {
        return LEVEL_REQUIREMENTS[level + 1] || null;
      };

      expect(getNextLevelRequirement(1)).toBe(8);
      expect(getNextLevelRequirement(5)).toBe(25);
      expect(getNextLevelRequirement(10)).toBe(null);
    });
  });

  describe('Resource Management', () => {
    test('inventory item counting', () => {
      const countInventoryItems = (inventory) => {
        return Object.values(inventory).reduce((total, amount) => total + amount, 0);
      };

      const testInventory = { wood: 5, stone: 3, dirt: 2 };
      expect(countInventoryItems(testInventory)).toBe(10);
      
      const emptyInventory = { wood: 0, stone: 0, dirt: 0 };
      expect(countInventoryItems(emptyInventory)).toBe(0);
    });

    test('resource sufficiency check', () => {
      const hasResources = (inventory, required) => {
        return Object.entries(required).every(([resource, amount]) => {
          return inventory[resource] >= amount;
        });
      };

      const inventory = { wood: 10, stone: 5, iron_ore: 2 };
      const recipe1 = { wood: 5, stone: 2 };
      const recipe2 = { wood: 15, stone: 2 };
      const recipe3 = { wood: 5, iron_ore: 3 };

      expect(hasResources(inventory, recipe1)).toBe(true);
      expect(hasResources(inventory, recipe2)).toBe(false);
      expect(hasResources(inventory, recipe3)).toBe(false);
    });
  });
});