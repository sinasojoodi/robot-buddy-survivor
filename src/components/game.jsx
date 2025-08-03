/*
 * Copyright 2024 Sina Sojoodi, Owen Sojoodi, and Aiden Sojoodi
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- GAME CONFIGURATION ---
const GAME_CONFIG = {
  width: 800,
  height: 600,
  blockSize: 32,
  playerSpeed: 2.5,
  robotSpeed: 2,
  attackRange: 45,
  robotAttackRange: 80,
  miningRange: 40,
};

// --- COLORS ---
const COLORS = {
  // Player colors
  PLAYER_DEFAULT: '#4dabf7',
  PLAYER_ATTACKING: '#ff6b6b',
  PLAYER_HELMET: '#ffd700',
  PLAYER_SWORD: '#c0c0c0',
  
  // Robot colors
  ROBOT_DEFAULT: '#9c27b0',
  ROBOT_UPGRADED: '#ff6b9d',
  ROBOT_ATTACKING: '#ff9800',
  ROBOT_EYE_NORMAL: '#00ff00',
  ROBOT_EYE_LOW_ENERGY: '#ff6600',
  ROBOT_EYE_ATTACKING: '#ff0000',
  ROBOT_LASER: '#00ffff',
  
  // UI colors
  HEALTH_BAR_BG: '#ff0000',
  HEALTH_BAR_FG: '#00ff00',
  HUNGER_BAR_BG: '#8b4513',
  HUNGER_BAR_FG: '#ffa500',
  ENERGY_BAR_BG: '#666',
  ENERGY_BAR_FG: '#00bfff',
  
  // Environment colors
  SKY_DAY_TOP: '#87CEEB',
  SKY_DAY_BOTTOM: '#98FB98',
  MINING_BASE_ALPHA: 0.3,
  MINING_MAX_ALPHA: 0.7,
  
  // General colors
  BLACK: '#000',
  WHITE: '#fff',
  YELLOW: '#ffff00',
};

// --- TIMING VALUES ---
const TIMING = {
  PLAYER_ATTACK_COOLDOWN: 800,
  ROBOT_ATTACK_COOLDOWN: 1000,
  ENEMY_ATTACK_COOLDOWN: 1200,
  ROBOT_RESPAWN_TIME: 10000,
  DROP_LIFETIME: 30000,
  GAME_LOOP_INTERVAL: 16,
  PLAYER_ATTACK_ANIMATION_THRESHOLD: 600,
  ROBOT_ATTACK_ANIMATION_THRESHOLD: 800,
};

// --- DISTANCES ---
const DISTANCES = {
  COLLISION_RANGE: 45,
  PICKUP_RANGE: 25,
  ROBOT_FOLLOW_DISTANCE: 70,
  ENEMY_CHASE_DISTANCE: 30,
};

// --- UI DIMENSIONS ---
const UI = {
  PLAYER_SIZE: 32,
  ROBOT_SIZE: 24,
  DROP_SIZE: 12,
  HEALTH_BAR_WIDTH: 180,
  HEALTH_BAR_HEIGHT: 15,
  HUNGER_BAR_HEIGHT: 10,
  ROBOT_BAR_WIDTH: 150,
  INVENTORY_PANEL: { x: 380, y: 500, width: 400, height: 90 },
};

// --- ITEM COLORS (extracted from BLOCK_TYPES to avoid repetition) ---
const ITEM_COLORS = {
  wood: '#daa520',
  stone: '#666666',
  dirt: '#8b4513',
  coal: '#2f2f2f',
  iron_ore: '#cd853f',
  diamond: '#b9f2ff',
  obsidian: '#1a1a1a',
};

// --- BLOCK TYPES ---
const BLOCK_TYPES = {
  GRASS: { color: '#4a9c2d', breakable: true, hardness: 1, drops: ['dirt'] },
  DIRT: { color: ITEM_COLORS.dirt, breakable: true, hardness: 1, drops: ['dirt'] },
  COAL: { color: ITEM_COLORS.coal, breakable: true, hardness: 1, drops: ['coal'] },
  STONE: { color: ITEM_COLORS.stone, breakable: true, hardness: 2, drops: ['stone'] },
  IRON_ORE: { color: ITEM_COLORS.iron_ore, breakable: true, hardness: 3, drops: ['iron_ore'] },
  DIAMOND_ORE: { color: ITEM_COLORS.diamond, breakable: true, hardness: 5, drops: ['diamond'] },
  WOOD: { color: ITEM_COLORS.wood, breakable: true, hardness: 1.5, drops: ['wood'] },
  OBSIDIAN: { color: ITEM_COLORS.obsidian, breakable: true, hardness: 8, drops: ['obsidian'] }
};

// --- PLACEABLE BLOCKS ---
const PLACEABLE_BLOCKS = Object.keys(BLOCK_TYPES);

// --- NEW: Define which blocks can be placed at each level ---
const LEVEL_PLACEABLE_BLOCKS = {
    1: ['WOOD', 'DIRT', 'GRASS'],
    2: ['WOOD', 'DIRT', 'GRASS', 'STONE'],
    3: ['WOOD', 'DIRT', 'GRASS', 'STONE', 'COAL'],
    4: ['WOOD', 'DIRT', 'GRASS', 'STONE', 'COAL', 'IRON_ORE'],
    5: ['WOOD', 'DIRT', 'GRASS', 'STONE', 'COAL', 'IRON_ORE'],
    6: ['WOOD', 'DIRT', 'GRASS', 'STONE', 'COAL', 'IRON_ORE', 'OBSIDIAN'],
    7: ['WOOD', 'DIRT', 'GRASS', 'STONE', 'COAL', 'IRON_ORE', 'OBSIDIAN', 'DIAMOND_ORE'],
    8: ['WOOD', 'DIRT', 'GRASS', 'STONE', 'COAL', 'IRON_ORE', 'OBSIDIAN', 'DIAMOND_ORE'],
    9: ['WOOD', 'DIRT', 'GRASS', 'STONE', 'COAL', 'IRON_ORE', 'OBSIDIAN', 'DIAMOND_ORE'],
    10: ['WOOD', 'DIRT', 'GRASS', 'STONE', 'COAL', 'IRON_ORE', 'OBSIDIAN', 'DIAMOND_ORE'],
};

// --- Mapping for Block Type to Inventory Item ---
const BLOCK_TO_INVENTORY_KEY = {
    GRASS: 'dirt',
    DIRT: 'dirt',
    COAL: 'coal',
    STONE: 'stone',
    IRON_ORE: 'iron_ore',
    DIAMOND_ORE: 'diamond',
    WOOD: 'wood',
    OBSIDIAN: 'obsidian',
};

// --- LEVEL REQUIREMENTS ---
const LEVEL_REQUIREMENTS = {
  1: 5, 2: 8, 3: 12, 4: 15, 5: 20, 6: 25, 7: 30, 8: 35, 9: 40, 10: 50
};

// --- ENEMY TYPES ---
const ENEMY_TYPES = {
  ZOMBIE: { color: '#228b22', health: 8, damage: 4, speed: 2.3, size: 28, armor: 0 },
  SKELETON: { color: '#f5f5dc', health: 6, damage: 5, speed: 2.4, size: 26, armor: 1 },
  CREEPER: { color: '#00ff00', health: 10, damage: 8, speed: 2.5, size: 30, armor: 1 },
  ENDERMAN: { color: '#1a1a1a', health: 12, damage: 6, speed: 2.6, size: 34, armor: 2 },
  DRAGON: { color: '#8b008b', health: 15, damage: 10, speed: 2.7, size: 48, armor: 3 }
};

// --- DROP TABLES ---
const DROP_TABLES = {
  ZOMBIE: [{ item: 'wood', weight: 40, color: ITEM_COLORS.wood }, { item: 'stone', weight: 30, color: ITEM_COLORS.stone }],
  SKELETON: [{ item: 'stone', weight: 35, color: ITEM_COLORS.stone }, { item: 'coal', weight: 25, color: ITEM_COLORS.coal }],
  CREEPER: [{ item: 'coal', weight: 40, color: ITEM_COLORS.coal }, { item: 'iron_ore', weight: 20, color: ITEM_COLORS.iron_ore }],
  ENDERMAN: [{ item: 'iron_ore', weight: 30, color: ITEM_COLORS.iron_ore }, { item: 'diamond', weight: 15, color: ITEM_COLORS.diamond }],
  DRAGON: [{ item: 'diamond', weight: 40, color: ITEM_COLORS.diamond }, { item: 'obsidian', weight: 30, color: ITEM_COLORS.obsidian }]
};

// --- TOOLS ---
const TOOLS = {
  WOODEN_SWORD: { damage: 15, durability: 30, miningPower: 1 },
  STONE_SWORD: { damage: 25, durability: 60, miningPower: 2 },
  IRON_SWORD: { damage: 40, durability: 120, miningPower: 3 },
  DIAMOND_SWORD: { damage: 60, durability: 200, miningPower: 5 },
  OBSIDIAN_SWORD: { damage: 80, durability: 300, miningPower: 8 },
  LEGENDARY_SWORD: { damage: 120, durability: 500, miningPower: 12 },
  ROBOT_LASER: { damage: 30, durability: 999, miningPower: 0 }
};

// --- RECIPES ---
const RECIPES = {
  WOODEN_SWORD: { wood: 2, stone: 1 },
  STONE_SWORD: { wood: 1, stone: 3 },
  IRON_SWORD: { wood: 1, iron_ore: 3 },
  DIAMOND_SWORD: { wood: 1, diamond: 2, iron_ore: 1 },
  OBSIDIAN_SWORD: { diamond: 1, obsidian: 3, iron_ore: 2 },
  LEGENDARY_SWORD: { diamond: 3, obsidian: 2, coal: 5 },
  ROBOT_UPGRADE: { iron_ore: 5, diamond: 1 },
  ROBOT_ARMOR: { iron_ore: 3, stone: 5 },
  PLAYER_ARMOR: { iron_ore: 4, stone: 6 },
  HEALTH_BOOST: { coal: 8, wood: 10 },
  SPEED_BOOST: { diamond: 1, coal: 5 },
  DAMAGE_BOOST: { obsidian: 1, diamond: 1 },
};

// --- RECIPE DESCRIPTIONS ---
const RECIPE_DESCRIPTIONS = {
    WOODEN_SWORD: "A basic sword for starting out.",
    STONE_SWORD: "A sturdier sword with better damage.",
    IRON_SWORD: "A strong sword made from refined iron.",
    DIAMOND_SWORD: "A powerful sword that cuts through enemies.",
    OBSIDIAN_SWORD: "A very heavy and durable sword.",
    LEGENDARY_SWORD: "A mythical weapon of immense power.",
    ROBOT_UPGRADE: "Boosts robot's max health to 150 and base damage to 50.",
    ROBOT_ARMOR: "Increases robot's defense by 2.",
    PLAYER_ARMOR: "Increases your defense by 2.",
    HEALTH_BOOST: "Increases your maximum health by 20.",
    SPEED_BOOST: "Increases your movement speed by 0.5.",
    DAMAGE_BOOST: "Increases your attack damage by 20%."
};


function RobotBuddySurvivor() {
  const canvasRef = useRef(null);
  const keysRef = useRef(new Set());

  const [gameState, setGameState] = useState({
    level: 1,
    score: 0,
    killsThisLevel: 0,
    gameStarted: false,
    gameOver: false,
    gameWon: false,
    showCrafting: false,
    dayNight: 0,
    player: {
      x: 100, y: 300, health: 100, maxHealth: 100, hunger: 100,
      attacking: false, attackCooldown: 0, swordVisible: false,
      currentTool: 'WOODEN_SWORD', toolDurability: 30,
      armor: 0, speed: GAME_CONFIG.playerSpeed, damageMultiplier: 1,
      currentBlockType: 'WOOD', 
    },
    robot: {
      x: 130, y: 320, health: 75, maxHealth: 75, energy: 100, maxEnergy: 100,
      attacking: false, attackCooldown: 0, swordVisible: false,
      upgraded: false, armor: 0, isDead: false, respawnTimer: 0,
    },
    inventory: { wood: 5, stone: 3, dirt: 0, coal: 0, iron_ore: 0, diamond: 0, obsidian: 0 },
    enemies: [], blocks: [], drops: [],
    lastSpawn: 0, miningBlock: null, miningProgress: 0,
  });

  const initializeLevel = useCallback((level) => {
    const blocks = [];
    const width = Math.floor(GAME_CONFIG.width / GAME_CONFIG.blockSize);
    const height = Math.floor(GAME_CONFIG.height / GAME_CONFIG.blockSize);

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const noise = Math.sin(x * 0.3) * Math.cos(y * 0.2) + Math.random() * 0.5;
        if (y === height - 1) {
          blocks.push({ x: x * GAME_CONFIG.blockSize, y: y * GAME_CONFIG.blockSize, type: 'GRASS', destroyed: false });
        } else if (y > height - 4) {
          let blockType = 'DIRT';
          if (level >= 2 && Math.random() < 0.3) blockType = 'STONE';
          if (level >= 3 && Math.random() < 0.15) blockType = 'IRON_ORE';
          if (level >= 5 && Math.random() < 0.05) blockType = 'DIAMOND_ORE';
          if (level >= 7 && Math.random() < 0.1) blockType = 'OBSIDIAN';
          blocks.push({ x: x * GAME_CONFIG.blockSize, y: y * GAME_CONFIG.blockSize, type: blockType, destroyed: false });
        } else if (noise > 0.3 && Math.random() < 0.05 + level * 0.01) {
          const blockType = level <= 2 ? 'WOOD' : 'STONE';
          blocks.push({ x: x * GAME_CONFIG.blockSize, y: y * GAME_CONFIG.blockSize, type: blockType, destroyed: false });
        }
      }
    }

    setGameState(prev => ({
      ...prev, level, killsThisLevel: 0, enemies: [], blocks, drops: [],
      player: { ...prev.player, x: 100, y: 300, hunger: 100 },
      robot: { ...prev.robot, x: 130, y: 320, health: prev.robot.maxHealth, energy: prev.robot.maxEnergy, isDead: false, respawnTimer: 0 }
    }));
  }, []);

  const spawnEnemy = useCallback(() => {
    const { level, lastSpawn, enemies, dayNight } = gameState;
    const now = Date.now();
    const nightMultiplier = dayNight > 50 ? 1.5 : 1;
    const spawnRate = Math.max(5000 - (level - 1) * 400, 1500) / nightMultiplier;
    const maxEnemies = Math.max(2, Math.min(3 + Math.floor(level / 2), 8)) * nightMultiplier;

    if (now - lastSpawn > spawnRate && enemies.length < maxEnemies) {
      const enemyTypes = Object.keys(ENEMY_TYPES);
      let typeIndex = Math.min(Math.floor(level / 2), enemyTypes.length - 2);
      if (level >= 3 && Math.random() < 0.2 + level * 0.05) typeIndex = Math.min(typeIndex + 1, enemyTypes.length - 1);
      if (level >= 7 && Math.random() < 0.3) typeIndex = enemyTypes.length - 1;

      const enemyType = enemyTypes[typeIndex];
      const enemy = ENEMY_TYPES[enemyType];
      const spawnX = Math.random() < 0.5 ? -40 : GAME_CONFIG.width + 40;
      const spawnY = Math.random() * (GAME_CONFIG.height - 150) + 50;

      setGameState(prev => ({
        ...prev,
        enemies: [...prev.enemies, {
          id: Math.random(), type: enemyType, x: spawnX, y: spawnY,
          health: enemy.health, maxHealth: enemy.health, lastAttack: 0, lastRobotAttack: 0
        }],
        lastSpawn: now
      }));
    }
  }, [gameState]);

  const generateDrops = useCallback((enemyType, x, y) => {
    const dropTable = DROP_TABLES[enemyType];
    if (!dropTable) return [];
    const drops = [];
    const numDrops = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < numDrops; i++) {
      const totalWeight = dropTable.reduce((sum, item) => sum + item.weight, 0);
      let random = Math.random() * totalWeight;
      for (const dropItem of dropTable) {
        random -= dropItem.weight;
        if (random <= 0) {
          const dropX = x + (Math.random() - 0.5) * 40;
          const dropY = y + (Math.random() - 0.5) * 40;
          drops.push({
            id: Math.random(), item: dropItem.item, color: dropItem.color,
            x: Math.max(10, Math.min(dropX, GAME_CONFIG.width - 20)),
            y: Math.max(10, Math.min(dropY, GAME_CONFIG.height - 20)),
            createdTime: Date.now()
          });
          break;
        }
      }
    }
    return drops;
  }, []);

  const checkBlockCollision = useCallback((x, y, width, height, blocks) => {
    const checkRect = { x, y, width, height };
    for (const block of blocks) {
      if (block.destroyed) continue;
      const blockRect = { x: block.x, y: block.y, width: GAME_CONFIG.blockSize, height: GAME_CONFIG.blockSize };
      if (checkRect.x < blockRect.x + blockRect.width &&
          checkRect.x + checkRect.width > blockRect.x &&
          checkRect.y < blockRect.y + blockRect.height &&
          checkRect.y + checkRect.height > blockRect.y) {
        return true;
      }
    }
    return false;
  }, []);

  const handleMining = useCallback((newState) => {
    const keys = keysRef.current;
    if (!keys.has('Space')) {
        newState.miningBlock = null;
        newState.miningProgress = 0;
        return;
    }

    const nearbyBlocks = newState.blocks.filter(block => {
        if (block.destroyed || !BLOCK_TYPES[block.type].breakable) return false;
        const dx = (block.x + GAME_CONFIG.blockSize / 2) - (newState.player.x + 16);
        const dy = (block.y + GAME_CONFIG.blockSize / 2) - (newState.player.y + 16);
        return Math.sqrt(dx * dx + dy * dy) < GAME_CONFIG.miningRange;
    });

    if (nearbyBlocks.length > 0) {
        const targetBlock = nearbyBlocks[0];
        const blockType = BLOCK_TYPES[targetBlock.type];
        const tool = TOOLS[newState.player.currentTool];
        
        if (newState.miningBlock?.x !== targetBlock.x || newState.miningBlock?.y !== targetBlock.y) {
            newState.miningBlock = targetBlock;
            newState.miningProgress = 0;
        }

        const miningSpeed = Math.max(1, tool.miningPower / blockType.hardness) * 2;
        newState.miningProgress += miningSpeed;
        newState.player.swordVisible = true;

        if (newState.miningProgress >= 100) {
            const blockIndex = newState.blocks.findIndex(b => b.x === targetBlock.x && b.y === targetBlock.y);
            if (blockIndex !== -1) {
                newState.blocks[blockIndex].destroyed = true;
                blockType.drops.forEach(drop => {
                    if (newState.inventory.hasOwnProperty(drop)) {
                        newState.inventory[drop] += Math.floor(Math.random() * 2) + 1;
                    }
                });
                newState.player.toolDurability -= 1;
                if (newState.player.toolDurability <= 0) {
                    newState.player.currentTool = 'WOODEN_SWORD';
                    newState.player.toolDurability = TOOLS.WOODEN_SWORD.durability;
                }
            }
            newState.miningBlock = null;
            newState.miningProgress = 0;
        }
    } else {
        newState.miningBlock = null;
        newState.miningProgress = 0;
    }
  }, []);

  const canCraft = (recipe) => {
    return Object.entries(recipe).every(([item, amount]) => (gameState.inventory[item] || 0) >= amount);
  };

  const craftItem = (itemName) => {
    const recipe = RECIPES[itemName];
    if (!canCraft(recipe)) return;

    setGameState(prev => {
      const newInventory = { ...prev.inventory };
      Object.entries(recipe).forEach(([item, amount]) => { newInventory[item] -= amount; });

      let newPlayer = { ...prev.player };
      let newRobot = { ...prev.robot };

      if (itemName.includes('SWORD')) {
        newPlayer.currentTool = itemName;
        newPlayer.toolDurability = TOOLS[itemName].durability;
      } else {
          switch(itemName) {
              case 'ROBOT_UPGRADE':
                  newRobot.upgraded = true;
                  newRobot.maxHealth = 150;
                  newRobot.health = 150;
                  break;
              case 'ROBOT_ARMOR':
                  newRobot.armor = (newRobot.armor || 0) + 2;
                  break;
              case 'PLAYER_ARMOR':
                  newPlayer.armor = (newPlayer.armor || 0) + 2;
                  break;
              case 'HEALTH_BOOST':
                  newPlayer.maxHealth += 20;
                  newPlayer.health = newPlayer.maxHealth;
                  break;
              case 'SPEED_BOOST':
                  newPlayer.speed += 0.5;
                  break;
              case 'DAMAGE_BOOST':
                  newPlayer.damageMultiplier += 0.2;
                  break;
              default:
                  break;
          }
      }
      return { ...prev, inventory: newInventory, player: newPlayer, robot: newRobot, showCrafting: false };
    });
  };

  const gameLoop = useCallback(() => {
    if (!gameState.gameStarted || gameState.gameOver || gameState.showCrafting) return;

    setGameState(prev => {
      let newState = JSON.parse(JSON.stringify(prev));
      const keys = keysRef.current;
      
      newState.dayNight = (newState.dayNight + 0.05) % 100;
      
      newState.player.hunger = Math.max(0, newState.player.hunger - 0.01);
      if (newState.player.hunger <= 0) newState.player.health = Math.max(0, newState.player.health - 0.05);
      newState.robot.energy = Math.max(0, newState.robot.energy - 0.005);

      let newX = newState.player.x, newY = newState.player.y;
      if (keys.has('ArrowLeft')) newX -= newState.player.speed;
      if (keys.has('ArrowRight')) newX += newState.player.speed;
      if (keys.has('ArrowUp')) newY -= newState.player.speed;
      if (keys.has('ArrowDown')) newY += newState.player.speed;
      
      newX = Math.max(0, Math.min(newX, GAME_CONFIG.width - UI.PLAYER_SIZE));
      newY = Math.max(0, Math.min(newY, GAME_CONFIG.height - UI.PLAYER_SIZE));

      if (!checkBlockCollision(newX, newState.player.y, UI.PLAYER_SIZE, UI.PLAYER_SIZE, newState.blocks)) newState.player.x = newX;
      if (!checkBlockCollision(newState.player.x, newY, UI.PLAYER_SIZE, UI.PLAYER_SIZE, newState.blocks)) newState.player.y = newY;

      handleMining(newState);

      const nearbyEnemiesPlayer = newState.enemies.filter(e => Math.hypot(e.x - newState.player.x, e.y - newState.player.y) < GAME_CONFIG.attackRange);
      newState.player.swordVisible = nearbyEnemiesPlayer.length > 0 || newState.miningBlock;
      if (nearbyEnemiesPlayer.length > 0 && newState.player.attackCooldown <= 0 && !newState.miningBlock) {
        newState.player.attacking = true;
        newState.player.attackCooldown = TIMING.PLAYER_ATTACK_COOLDOWN;
        const tool = TOOLS[newState.player.currentTool];
        const damage = tool.damage * newState.player.damageMultiplier;

        newState.enemies.forEach(enemy => {
          if (Math.hypot(enemy.x - newState.player.x, enemy.y - newState.player.y) < GAME_CONFIG.attackRange) {
            const enemyConfig = ENEMY_TYPES[enemy.type];
            enemy.health -= Math.max(1, damage - enemyConfig.armor);
          }
        });
      }

      if (!newState.robot.isDead) {
        const robotDx = newState.player.x - newState.robot.x;
        const robotDy = newState.player.y - newState.robot.y;
        const robotDistance = Math.hypot(robotDx, robotDy);
        if (robotDistance > DISTANCES.ROBOT_FOLLOW_DISTANCE) {
          const energyMultiplier = newState.robot.energy > 20 ? 1 : 0.5;
          const newRobotX = newState.robot.x + (robotDx / robotDistance) * GAME_CONFIG.robotSpeed * energyMultiplier;
          const newRobotY = newState.robot.y + (robotDy / robotDistance) * GAME_CONFIG.robotSpeed * energyMultiplier;
          if (!checkBlockCollision(newRobotX, newState.robot.y, UI.ROBOT_SIZE, UI.ROBOT_SIZE, newState.blocks)) newState.robot.x = newRobotX;
          if (!checkBlockCollision(newState.robot.x, newRobotY, UI.ROBOT_SIZE, UI.ROBOT_SIZE, newState.blocks)) newState.robot.y = newRobotY;
        }

        const nearbyEnemiesRobot = newState.enemies.filter(e => Math.hypot(e.x - newState.robot.x, e.y - newState.robot.y) < GAME_CONFIG.robotAttackRange);
        newState.robot.swordVisible = nearbyEnemiesRobot.length > 0;
        if (nearbyEnemiesRobot.length > 0 && newState.robot.attackCooldown <= 0 && newState.robot.energy > 10) {
          newState.robot.attacking = true;
          newState.robot.attackCooldown = TIMING.ROBOT_ATTACK_COOLDOWN;
          newState.robot.energy -= 5;
          const robotDamage = newState.robot.upgraded ? 50 : 30;
          nearbyEnemiesRobot[0].health -= Math.max(1, robotDamage - ENEMY_TYPES[nearbyEnemiesRobot[0].type].armor);
        }
      }

      newState.enemies.forEach(enemy => {
          const enemyConfig = ENEMY_TYPES[enemy.type];
          let targetX = newState.player.x, targetY = newState.player.y;
          if(!newState.robot.isDead && Math.hypot(enemy.x - newState.robot.x, enemy.y - newState.robot.y) < Math.hypot(enemy.x - newState.player.x, enemy.y - newState.player.y)){
              targetX = newState.robot.x;
              targetY = newState.robot.y;
          }
          const dx = targetX - enemy.x;
          const dy = targetY - enemy.y;
          const dist = Math.hypot(dx, dy);
          if (dist > DISTANCES.ENEMY_CHASE_DISTANCE) {
              const nightSpeedBonus = newState.dayNight > 50 ? 1.1 : 1;
              const newEnemyX = enemy.x + (dx / dist) * enemyConfig.speed * nightSpeedBonus;
              const newEnemyY = enemy.y + (dy / dist) * enemyConfig.speed * nightSpeedBonus;
              if (!checkBlockCollision(newEnemyX, enemy.y, enemyConfig.size, enemyConfig.size, newState.blocks)) enemy.x = newEnemyX;
              if (!checkBlockCollision(enemy.x, newEnemyY, enemyConfig.size, enemyConfig.size, newState.blocks)) enemy.y = newEnemyY;
          }

          const now = Date.now();
          if (Math.hypot(enemy.x - newState.player.x, enemy.y - newState.player.y) < DISTANCES.COLLISION_RANGE && now - enemy.lastAttack > TIMING.ENEMY_ATTACK_COOLDOWN) {
              newState.player.health -= Math.max(1, enemyConfig.damage - newState.player.armor);
              enemy.lastAttack = now;
          }
          if (!newState.robot.isDead && Math.hypot(enemy.x - newState.robot.x, enemy.y - newState.robot.y) < DISTANCES.COLLISION_RANGE && now - (enemy.lastRobotAttack || 0) > TIMING.ENEMY_ATTACK_COOLDOWN) {
              newState.robot.health -= Math.max(1, enemyConfig.damage - newState.robot.armor);
              enemy.lastRobotAttack = now;
          }
      });
      
      const killedEnemies = newState.enemies.filter(e => e.health <= 0);
      if (killedEnemies.length > 0) {
        killedEnemies.forEach(enemy => {
          const newDrops = generateDrops(enemy.type, enemy.x, enemy.y);
          newState.drops.push(...newDrops);
          newState.score += 15;
          newState.killsThisLevel += 1;
        });
        newState.enemies = newState.enemies.filter(e => e.health > 0);
      }

      newState.player.attackCooldown = Math.max(0, newState.player.attackCooldown - TIMING.GAME_LOOP_INTERVAL);
      newState.robot.attackCooldown = Math.max(0, newState.robot.attackCooldown - TIMING.GAME_LOOP_INTERVAL);
      newState.player.attacking = newState.player.attackCooldown > TIMING.PLAYER_ATTACK_ANIMATION_THRESHOLD;
      newState.robot.attacking = newState.robot.attackCooldown > TIMING.ROBOT_ATTACK_ANIMATION_THRESHOLD;

      if (!newState.robot.isDead && newState.robot.health <= 0) {
        newState.robot.isDead = true;
        newState.robot.respawnTimer = TIMING.ROBOT_RESPAWN_TIME;
      }
      if (newState.robot.isDead) {
                  newState.robot.respawnTimer -= TIMING.GAME_LOOP_INTERVAL;
        if (newState.robot.respawnTimer <= 0) {
          newState.robot.isDead = false;
          newState.robot.health = newState.robot.maxHealth;
          newState.robot.energy = newState.robot.maxEnergy;
          newState.robot.x = newState.player.x + 40;
          newState.robot.y = newState.player.y + 20;
        }
      }

      newState.drops = newState.drops.filter(drop => {
        if (Math.hypot(drop.x - newState.player.x, drop.y - newState.player.y) < DISTANCES.PICKUP_RANGE) {
          newState.inventory[drop.item] = (newState.inventory[drop.item] || 0) + 1;
          return false;
        }
                  return (Date.now() - drop.createdTime) < TIMING.DROP_LIFETIME;
      });

      const requiredKills = LEVEL_REQUIREMENTS[newState.level];
      if (newState.killsThisLevel >= requiredKills) {
        const nextLevel = newState.level + 1;
        if (nextLevel > 10) {
            newState.gameOver = true;
            newState.gameWon = true;
        } else {
            return { ...newState, level: nextLevel, killsThisLevel: 0 };
        }
      }

      if (newState.player.health <= 0) {
        newState.gameOver = true;
      }

      return newState;
    });

    spawnEnemy();
  }, [gameState.gameStarted, gameState.gameOver, gameState.showCrafting, spawnEnemy, initializeLevel, handleMining, generateDrops, checkBlockCollision]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);

    const isNight = gameState.dayNight > 50;
    const nightIntensity = isNight ? (gameState.dayNight - 50) / 50 : 0;
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_CONFIG.height);
    if (isNight) {
      gradient.addColorStop(0, `rgb(${20 - nightIntensity * 10}, ${20 - nightIntensity * 10}, ${60 - nightIntensity * 20})`);
      gradient.addColorStop(1, `rgb(10, 10, 30)`);
    } else {
      gradient.addColorStop(0, COLORS.SKY_DAY_TOP);
      gradient.addColorStop(1, COLORS.SKY_DAY_BOTTOM);
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);

    gameState.blocks.forEach(block => {
      if (!block.destroyed) {
        ctx.fillStyle = BLOCK_TYPES[block.type].color;
        ctx.fillRect(block.x, block.y, GAME_CONFIG.blockSize, GAME_CONFIG.blockSize);
        ctx.strokeStyle = COLORS.BLACK;
        ctx.lineWidth = 1;
        ctx.strokeRect(block.x, block.y, GAME_CONFIG.blockSize, GAME_CONFIG.blockSize);
        if (gameState.miningBlock?.x === block.x && gameState.miningBlock?.y === block.y) {
          ctx.fillStyle = `rgba(255, 255, 0, ${COLORS.MINING_BASE_ALPHA + (gameState.miningProgress / 100) * (COLORS.MINING_MAX_ALPHA - COLORS.MINING_BASE_ALPHA)})`;
          ctx.fillRect(block.x, block.y, GAME_CONFIG.blockSize, GAME_CONFIG.blockSize);
        }
      }
    });

    ctx.fillStyle = gameState.player.attacking ? COLORS.PLAYER_ATTACKING : COLORS.PLAYER_DEFAULT;
    ctx.fillRect(gameState.player.x, gameState.player.y, UI.PLAYER_SIZE, UI.PLAYER_SIZE);
    ctx.strokeStyle = COLORS.BLACK;
    ctx.lineWidth = 2;
    ctx.strokeRect(gameState.player.x, gameState.player.y, UI.PLAYER_SIZE, UI.PLAYER_SIZE);
    ctx.fillStyle = COLORS.PLAYER_HELMET;
    ctx.fillRect(gameState.player.x + 6, gameState.player.y - 4, 20, 8);
    if (gameState.player.swordVisible) {
      ctx.fillStyle = COLORS.PLAYER_SWORD;
      ctx.fillRect(gameState.player.x + 35, gameState.player.y + 10, 25, 6);
    }

    if (!gameState.robot.isDead) {
      const robotColor = gameState.robot.upgraded ? COLORS.ROBOT_UPGRADED : COLORS.ROBOT_DEFAULT;
      ctx.fillStyle = gameState.robot.attacking ? COLORS.ROBOT_ATTACKING : robotColor;
             ctx.fillRect(gameState.robot.x, gameState.robot.y, UI.ROBOT_SIZE, UI.ROBOT_SIZE);
       ctx.strokeStyle = COLORS.BLACK;
       ctx.strokeRect(gameState.robot.x, gameState.robot.y, UI.ROBOT_SIZE, UI.ROBOT_SIZE);
      const eyeColor = gameState.robot.energy > 20 ? COLORS.ROBOT_EYE_NORMAL : COLORS.ROBOT_EYE_LOW_ENERGY;
      ctx.fillStyle = gameState.robot.attacking ? COLORS.ROBOT_EYE_ATTACKING : eyeColor;
      ctx.fillRect(gameState.robot.x + 6, gameState.robot.y + 6, 4, 4);
      ctx.fillRect(gameState.robot.x + 14, gameState.robot.y + 6, 4, 4);
      if (gameState.robot.swordVisible) {
        ctx.fillStyle = COLORS.ROBOT_LASER;
        ctx.fillRect(gameState.robot.x + 27, gameState.robot.y + 8, 20, 4);
      }
    }

    gameState.enemies.forEach(enemy => {
        const enemyConfig = ENEMY_TYPES[enemy.type];
        const radius = enemyConfig.size / 2;
        ctx.beginPath();
        ctx.arc(enemy.x + radius, enemy.y + radius, radius, 0, 2 * Math.PI);
        ctx.fillStyle = enemyConfig.color;
        ctx.fill();
        ctx.strokeStyle = COLORS.BLACK;
        ctx.stroke();
        const healthPercent = enemy.health / enemy.maxHealth;
                 ctx.fillStyle = COLORS.HEALTH_BAR_BG;
         ctx.fillRect(enemy.x, enemy.y - 8, enemyConfig.size, 4);
         ctx.fillStyle = COLORS.HEALTH_BAR_FG;
         ctx.fillRect(enemy.x, enemy.y - 8, enemyConfig.size * healthPercent, 4);
    });

    gameState.drops.forEach(drop => {
        ctx.fillStyle = drop.color;
                 ctx.fillRect(drop.x, drop.y, UI.DROP_SIZE, UI.DROP_SIZE);
         ctx.strokeStyle = COLORS.WHITE;
         ctx.strokeRect(drop.x, drop.y, UI.DROP_SIZE, UI.DROP_SIZE);
    });

    // --- UI ---
    ctx.fillStyle = COLORS.WHITE;
    ctx.font = 'bold 18px Arial';
    ctx.fillText(`Level: ${gameState.level}`, 10, 25);
    ctx.fillText(`Score: ${gameState.score}`, 10, 45);
    ctx.fillText(`Kills: ${gameState.killsThisLevel} / ${LEVEL_REQUIREMENTS[gameState.level]}`, 10, 65);
    
    // Player Stats
         ctx.fillStyle = COLORS.HEALTH_BAR_BG; ctx.fillRect(10, 510, UI.HEALTH_BAR_WIDTH, UI.HEALTH_BAR_HEIGHT);
     ctx.fillStyle = COLORS.HEALTH_BAR_FG; ctx.fillRect(10, 510, UI.HEALTH_BAR_WIDTH * (gameState.player.health / gameState.player.maxHealth), UI.HEALTH_BAR_HEIGHT);
     ctx.fillStyle = COLORS.HUNGER_BAR_BG; ctx.fillRect(10, 530, UI.HEALTH_BAR_WIDTH, UI.HUNGER_BAR_HEIGHT);
     ctx.fillStyle = COLORS.HUNGER_BAR_FG; ctx.fillRect(10, 530, UI.HEALTH_BAR_WIDTH * (gameState.player.hunger / 100), UI.HUNGER_BAR_HEIGHT);
    
    ctx.fillStyle = COLORS.WHITE;
    ctx.font = 'bold 12px Arial';
    const playerDamage = (TOOLS[gameState.player.currentTool].damage * gameState.player.damageMultiplier).toFixed(0);
    ctx.fillText(`HP: ${Math.ceil(gameState.player.health)} / ${gameState.player.maxHealth}`, 12, 522);
    ctx.fillText(`DMG: ${playerDamage}`, 120, 522);


    // Robot Stats
    if (!gameState.robot.isDead) {
                 ctx.fillStyle = COLORS.HEALTH_BAR_BG; ctx.fillRect(200, 510, UI.ROBOT_BAR_WIDTH, UI.HEALTH_BAR_HEIGHT);
         ctx.fillStyle = COLORS.HEALTH_BAR_FG; ctx.fillRect(200, 510, UI.ROBOT_BAR_WIDTH * (gameState.robot.health / gameState.robot.maxHealth), UI.HEALTH_BAR_HEIGHT);
         ctx.fillStyle = COLORS.ENERGY_BAR_BG; ctx.fillRect(200, 530, UI.ROBOT_BAR_WIDTH, UI.HUNGER_BAR_HEIGHT);
         ctx.fillStyle = COLORS.ENERGY_BAR_FG; ctx.fillRect(200, 530, UI.ROBOT_BAR_WIDTH * (gameState.robot.energy / gameState.robot.maxEnergy), UI.HUNGER_BAR_HEIGHT);
        
        ctx.fillStyle = COLORS.WHITE;
        ctx.font = 'bold 12px Arial';
        const robotDamage = gameState.robot.upgraded ? 50 : 30;
        ctx.fillText(`HP: ${Math.ceil(gameState.robot.health)} / ${gameState.robot.maxHealth}`, 202, 522);
        ctx.fillText(`DMG: ${robotDamage}`, 290, 522);

    } else {
        const respawnProgress = 1 - (gameState.robot.respawnTimer / TIMING.ROBOT_RESPAWN_TIME);
                 ctx.fillStyle = COLORS.HEALTH_BAR_BG; ctx.fillRect(200, 510, UI.ROBOT_BAR_WIDTH, UI.HEALTH_BAR_HEIGHT);
         ctx.fillStyle = COLORS.YELLOW; ctx.fillRect(200, 510, UI.ROBOT_BAR_WIDTH * respawnProgress, UI.HEALTH_BAR_HEIGHT);
        ctx.fillStyle = COLORS.BLACK; ctx.font = '12px Arial';
        ctx.fillText('Robot Respawning...', 202, 523);
    }

    // Inventory and Placeable Block
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; ctx.fillRect(UI.INVENTORY_PANEL.x, UI.INVENTORY_PANEL.y, UI.INVENTORY_PANEL.width, UI.INVENTORY_PANEL.height);
    ctx.fillStyle = COLORS.WHITE; ctx.font = 'bold 14px Arial'; ctx.fillText('INVENTORY', 385, 518);
    Object.entries(gameState.inventory).forEach(([item, amount], index) => {
      const x = 385 + (index % 4) * 95;
      const y = 535 + Math.floor(index / 4) * 20;
      ctx.fillStyle = amount > 0 ? COLORS.WHITE : '#888888';
      ctx.fillText(`${item.replace('_', ' ')}: ${amount}`, x, y);
    });

    const currentBlock = gameState.player.currentBlockType;
    ctx.fillStyle = COLORS.WHITE;
    ctx.font = 'bold 12px Arial';
    ctx.fillText('Placing:', 680, 575);
    ctx.fillStyle = BLOCK_TYPES[currentBlock].color;
    ctx.fillRect(730, 565, 15, 15);
    ctx.strokeStyle = COLORS.WHITE;
    ctx.strokeRect(730, 565, 15, 15);
    ctx.fillStyle = COLORS.WHITE;
    ctx.fillText(currentBlock.replace('_', ' '), 750, 575);


  }, [gameState]);

  useEffect(() => {
    const handleKeyDown = (e) => {
        keysRef.current.add(e.code);
        if (e.code === 'KeyC') {
            e.preventDefault();
            setGameState(prev => ({ ...prev, showCrafting: !prev.showCrafting }));
        }
        if (e.code === 'Escape') {
            e.preventDefault();
            setGameState(prev => ({ ...prev, showCrafting: false }));
        }
        if (e.code === 'KeyZ') {
            e.preventDefault();
            setGameState(prev => {
                const allowedForLevel = LEVEL_PLACEABLE_BLOCKS[prev.level] || PLACEABLE_BLOCKS;
                const validBlocks = allowedForLevel.filter(blockType => {
                    const inventoryKey = BLOCK_TO_INVENTORY_KEY[blockType];
                    return prev.inventory[inventoryKey] > 0;
                });

                if (validBlocks.length === 0) {
                    return prev;
                }

                const currentIndex = validBlocks.indexOf(prev.player.currentBlockType);
                const nextIndex = (currentIndex === -1) ? 0 : (currentIndex + 1) % validBlocks.length;
                
                return { ...prev, player: { ...prev.player, currentBlockType: validBlocks[nextIndex] } };
            });
        }
        if (e.code === 'KeyX') {
            e.preventDefault();
            setGameState(prev => {
                const blockToPlace = prev.player.currentBlockType;
                const inventoryKey = BLOCK_TO_INVENTORY_KEY[blockToPlace];
                
                if (prev.inventory[inventoryKey] > 0) {
                    const placeX = Math.round((prev.player.x + UI.PLAYER_SIZE / 2 - GAME_CONFIG.blockSize / 2) / GAME_CONFIG.blockSize) * GAME_CONFIG.blockSize;
                    const placeY = (Math.floor(prev.player.y / GAME_CONFIG.blockSize) - 1) * GAME_CONFIG.blockSize;

                    const targetRect = { x: placeX, y: placeY, width: GAME_CONFIG.blockSize, height: GAME_CONFIG.blockSize };

                    const isOccupiedByBlock = prev.blocks.some(b => 
                        !b.destroyed && 
                        b.x === placeX && 
                        b.y === placeY
                    );

                    const isOccupiedByEnemy = prev.enemies.some(e => {
                        const enemyConfig = ENEMY_TYPES[e.type];
                        const enemyRect = { x: e.x, y: e.y, width: enemyConfig.size, height: enemyConfig.size };
                        return (
                            targetRect.x < enemyRect.x + enemyRect.width &&
                            targetRect.x + targetRect.width > enemyRect.x &&
                            targetRect.y < enemyRect.y + enemyRect.height &&
                            targetRect.y + targetRect.height > enemyRect.y
                        );
                    });
                    
                    let isOccupiedByRobot = false;
                    if (!prev.robot.isDead) {
                        const robotRect = { x: prev.robot.x, y: prev.robot.y, width: UI.ROBOT_SIZE, height: UI.ROBOT_SIZE };
                        isOccupiedByRobot = (
                            targetRect.x < robotRect.x + robotRect.width &&
                            targetRect.x + targetRect.width > robotRect.x &&
                            targetRect.y < robotRect.y + robotRect.height &&
                            targetRect.y + targetRect.height > robotRect.y
                        );
                    }

                    if (!isOccupiedByBlock && !isOccupiedByEnemy && !isOccupiedByRobot && placeY >= 0) {
                        const newBlocks = [...prev.blocks, { x: placeX, y: placeY, type: blockToPlace, destroyed: false }];
                        const newInventory = { ...prev.inventory, [inventoryKey]: prev.inventory[inventoryKey] - 1 };
                        
                        let newPlayerState = { ...prev.player };
                        if (newInventory[inventoryKey] === 0) {
                            const allowedForLevel = LEVEL_PLACEABLE_BLOCKS[prev.level] || PLACEABLE_BLOCKS;
                            const remainingValidBlocks = allowedForLevel.filter(blockType => {
                                const invKey = BLOCK_TO_INVENTORY_KEY[blockType];
                                return newInventory[invKey] > 0;
                            });

                            if (remainingValidBlocks.length > 0) {
                                newPlayerState.currentBlockType = remainingValidBlocks[0];
                            }
                        }
                        
                        return { ...prev, blocks: newBlocks, inventory: newInventory, player: newPlayerState };
                    }
                }
                return prev;
            });
        }
    };
    const handleKeyUp = (e) => keysRef.current.delete(e.code);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (gameState.gameStarted && !gameState.gameOver) {
        const id = setInterval(gameLoop, TIMING.GAME_LOOP_INTERVAL);
        return () => clearInterval(id);
    }
  }, [gameState.gameStarted, gameState.gameOver, gameLoop]);

  useEffect(() => {
    render();
  }, [gameState, render]);

  useEffect(() => {
    if (gameState.gameStarted && !gameState.gameOver) {
        initializeLevel(gameState.level);
    }
  }, [gameState.level, gameState.gameStarted]);


  const startGame = () => {
    setGameState(prev => ({ ...prev, gameStarted: true, gameOver: false, level: 1 }));
  };

  const restartGame = () => {
    setGameState({
        level: 1, score: 0, killsThisLevel: 0, gameStarted: false, gameOver: false, gameWon: false, showCrafting: false, dayNight: 0,
        player: { x: 100, y: 300, health: 100, maxHealth: 100, hunger: 100, attacking: false, attackCooldown: 0, swordVisible: false, currentTool: 'WOODEN_SWORD', toolDurability: 30, armor: 0, speed: GAME_CONFIG.playerSpeed, damageMultiplier: 1, currentBlockType: 'WOOD' },
        robot: { x: 130, y: 320, health: 75, maxHealth: 75, energy: 100, maxEnergy: 100, attacking: false, attackCooldown: 0, swordVisible: false, upgraded: false, armor: 0, isDead: false, respawnTimer: 0 },
        inventory: { wood: 5, stone: 3, dirt: 0, coal: 0, iron_ore: 0, diamond: 0, obsidian: 0 },
        enemies: [], blocks: [], drops: [], lastSpawn: 0, miningBlock: null, miningProgress: 0,
    });
    setGameState(prev => ({ ...prev, gameStarted: true }));
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-800 p-4 font-sans">
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-5xl w-full">
        <h1 className="text-4xl font-bold text-center mb-4 text-gray-800">
          🤖 Robot Buddy Survivor ⚔️
        </h1>
        
        {!gameState.gameStarted ? (
          <div className="text-center">
            <div className="mb-6 text-left max-w-2xl mx-auto bg-gray-100 p-4 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4 text-center">How to Survive</h2>
              <p className="text-gray-700 mb-2"><strong>• Arrow Keys:</strong> Move your character.</p>
              <p className="text-gray-700 mb-2"><strong>• Spacebar:</strong> Mine blocks when standing close.</p>
              <p className="text-gray-700 mb-2"><strong>• 'C' Key:</strong> Open the crafting menu.</p>
              <p className="text-gray-700 mb-2"><strong>• 'Z' Key:</strong> Cycle through blocks to place.</p>
              <p className="text-gray-700 mb-2"><strong>• 'X' Key:</strong> Place the selected block above you.</p>
            </div>
            <button
              onClick={startGame}
              className="bg-green-600 hover:bg-green-800 text-white font-bold py-3 px-6 rounded-lg text-xl transition-all duration-200 transform hover:scale-105"
            >
              Start Mining Adventure!
            </button>
          </div>
        ) : gameState.gameOver ? (
          <div className="text-center">
            {gameState.gameWon ? (
              <>
                <h2 className="text-4xl font-bold text-yellow-600 mb-4">🎉 VICTORY! 🎉</h2>
                <p className="text-2xl mb-2 text-green-600">Congratulations! You've conquered all 10 levels!</p>
                <p className="text-xl mb-2">🏆 You are a true mining champion! 🏆</p>
                <p className="text-lg mb-2">Final Score: {gameState.score}</p>
                <p className="text-lg mb-4">You've mastered the art of survival!</p>
                <button
                  onClick={restartGame}
                  className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg text-xl transition-all duration-200 transform hover:scale-105"
                >
                  🎮 Play Again for Glory! 🎮
                </button>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-red-600 mb-4">Game Over!</h2>
                <p className="text-xl mb-2">You were defeated!</p>
                <p className="text-lg mb-2">Final Score: {gameState.score}</p>
                <p className="text-lg mb-4">Level Reached: {gameState.level}</p>
                <button
                  onClick={restartGame}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-xl transition-all duration-200 transform hover:scale-105"
                >
                  Mine Again!
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="relative text-center">
            {gameState.showCrafting && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 p-4">
                <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <h2 className="text-2xl font-bold mb-4">🔨 Crafting Table</h2>
                    <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">Your Resources:</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">
                        {Object.entries(gameState.inventory).map(([item, amount]) => (
                          <div key={item} className={`p-2 rounded ${amount > 0 ? 'bg-green-200' : 'bg-red-200'}`}>
                            <strong>{item.replace('_', ' ')}</strong>: {amount}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      {Object.entries(RECIPES).map(([item, recipe]) => {
                        const canCraftItem = canCraft(recipe);
                        return (
                          <div key={item} className={`p-4 border-2 rounded-lg ${canCraftItem ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'}`}>
                            <h3 className="font-bold text-lg mb-1">{item.replace(/_/g, ' ')}</h3>
                            <p className="text-xs text-gray-600 mb-2 h-8">{RECIPE_DESCRIPTIONS[item]}</p>
                            <div className="mb-3 text-left">
                              {Object.entries(recipe).map(([mat, amount]) => {
                                const hasEnough = (gameState.inventory[mat] || 0) >= amount;
                                return (
                                  <p key={mat} className={`text-sm ${hasEnough ? 'text-green-700' : 'text-red-700'}`}>
                                    {mat.replace('_', ' ')}: {amount} 
                                    <span className="text-gray-600"> (have: {gameState.inventory[mat] || 0})</span>
                                  </p>
                                );
                              })}
                            </div>
                            <button
                              onClick={() => canCraftItem && craftItem(item)}
                              disabled={!canCraftItem}
                              className={`w-full px-4 py-2 rounded text-sm font-bold ${canCraftItem ? 'bg-green-500 hover:bg-green-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                            >
                              {canCraftItem ? 'CRAFT' : 'Need Resources'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setGameState(prev => ({ ...prev, showCrafting: false }))}
                      className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Close Crafting (ESC)
                    </button>
                </div>
              </div>
            )}
            
            <canvas
              ref={canvasRef}
              width={GAME_CONFIG.width}
              height={GAME_CONFIG.height}
              className="border-4 border-gray-800 rounded-lg bg-sky-200"
              tabIndex="0"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default RobotBuddySurvivor;
export { GAME_CONFIG, BLOCK_TYPES, LEVEL_REQUIREMENTS, ENEMY_TYPES };
