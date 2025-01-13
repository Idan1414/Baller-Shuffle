const determinePlayerBuild = (sport, stats) => {

  // Helper function to check if other stats are in range
  const areOtherStatsInRange = (primaryStat, minRange, maxRange) => {
      return Object.entries(stats).every(([key, value]) => {
          if (key === primaryStat || typeof value !== 'number') return true;
          return value >= minRange && value <= maxRange;
      });
  };


  if (sport === 'Basketball') {
      const {
          scoring,
          passing,
          speed,
          physical,
          defence,
          threePtShot,
          rebound,
          ballHandling,
          postUp,
          height
      } = stats;



      // 1. GOAT Tier
      if (Object.values(stats).every(stat => typeof stat === 'number' && stat >= 95)) {
          return "GOAT";
      }

      // 2. Legendary Tier (90+ all stats)
      if (Object.values(stats).every(stat => typeof stat === 'number' && stat >= 90)) {
          return "Legendary All-Around";
      }

      // 3. Elite Multi-Attribute Builds (Mixed 90/85)
      if (threePtShot >= 85 && ballHandling >= 90 && scoring >= 85 && defence >= 90 && rebound >= 90) {
          return "Elite 2-Way Shot Creator";
      }

      if (defence >= 90 && passing >= 85 && ballHandling >= 90 && scoring >= 85) {
          return "Elite 2-Way Playmaker";
      }

      if (threePtShot >= 90 && ballHandling >= 90 && scoring >= 85 && passing >= 85) {
          return "Elite Shot Creator";
      }

      if (rebound >= 90 && postUp >= 85 && physical >= 85 && defence >= 85 && height >= 185) {
          return "Elite Paint Beast";
      }

      if (scoring >= 90 && speed >= 85 && threePtShot >= 85 && ballHandling >= 85) {
          return "Elite Offensive Weapon";
      }

      if (defence >= 90 && speed >= 90 && physical >= 85 && rebound >= 85) {
          return "Elite Defensive Stopper";
      }

      if (physical >= 90 && threePtShot >= 90 && defence >= 85 && scoring >= 85) {
          return "Elite Shooting Beast";
      }

      // 4. Elite Mixed-Rating Combinations
      if (threePtShot >= 90 && scoring >= 85 && ballHandling >= 80) {
          return "Scoring Specialist";
      }

      if (postUp >= 90 && passing >= 85 && physical >= 85) {
          return "Paint Beast Playmaker";
      }


      if (defence >= 90 && physical >= 85 && rebound >= 85 && height >= 185) {
          return "Rim Protector";
      }

      if (passing >= 90 && ballHandling >= 85 && speed >= 80) {
          return "Playmaking Wizard";
      }

      if (postUp >= 90 && physical >= 85 && scoring >= 80) {
          return "Post Scoring Specialist";
      }
      // 4.5 Elite 2 Attributes 1 +95 Rating Combinations


      if (postUp >= 95 && physical >= 75) {
          return "Post-Up Dominator";
      }

      if (threePtShot >= 95 && scoring >= 75) {
          return "Range Sniper";
      }

      if (defence >= 95 && speed >= 75) {
          return "Defensive Specialist";
      }
      if (rebound >= 95 && physical >= 75) {
          return "Legendary Glass Cleaner";
      }
      if (ballHandling >= 95 && passing >= 90) {
          return "Elite Playmaker";
      }
      if (scoring >= 95 && ballHandling >= 75) {
          return "Elite Scorer";
      }
      if (threePtShot >= 95 && rebound >= 85) {
          return "Elite Stretch Big";
      }
      if (defence >= 95 && scoring >= 85) {
          return "Elite 2-Way Player";
      }
      if (physical >= 95 && speed >= 85) {
          return "Elite Athletic";
      }
      if (postUp >= 95 && defence >= 85) {
          return "Elite Post Defender";
      }
      if (ballHandling >= 95 && speed >= 85) {
          return "Elite Ball Handler";
      }
      if (passing >= 95 && rebound >= 85) {
          return "Elite Passing Big";
      }
      if (scoring >= 95 && physical >= 85) {
          return "Elite Scoring Big";
      }
      if (threePtShot >= 95 && passing >= 85 && height >= 185) {
          return "Elite Stretch 5";
      }
      if (passing >= 95 && defence >= 85) {
          return "Elite Playmaking Defender";
      }
      if (passing >= 95 && ballHandling >= 75) {
          return "Elite Passer";
      }
      if (scoring >= 95 && defence >= 85) {
          return "Elite Scoring Defender";
      }
      if (scoring >= 95 && passing >= 85) {
          return "Elite Scoring Playmaker";
      }
      if (scoring >= 95 && rebound >= 85) {
          return "Elite Scoring Big";
      }


      // 5. High-Tier Mixed Combinations
      if (scoring >= 85 && threePtShot >= 85 && defence >= 80 && speed >= 75) {
          return "2-Way Scoring Machine";
      }

      if (defence >= 85 && speed >= 75 && threePtShot >= 80 && physical >= 75) {
          return "2-Way Sharpshooter";
      }


      if (ballHandling >= 85 && speed >= 85 && scoring >= 80 && passing >= 75) {
          return "Offensive Threat";
      }

      if (rebound >= 85 && defence >= 85 && postUp >= 80 && physical >= 75) {
          return "Inside Force";
      }

      // 6. Strong Three-Stat Combinations
      if (threePtShot >= 85 && passing >= 85 && ballHandling >= 85) {
          return "Scoring Playmaker";
      }

      if (scoring >= 85 && speed >= 85 && physical >= 85) {
          return "Slashing Scorer";
      }

      if (defence >= 85 && speed >= 85 && physical >= 85) {
          return "Athletic Defender";
      }

      if (postUp >= 85 && physical >= 85 && threePtShot >= 85) {
          return "Inside-Out Bigman";
      }


      if (postUp >= 85 && physical >= 85 && rebound >= 85) {
          return "Inside Dominator";
      }

      // 7. Mixed-Rating Specialists
      if (threePtShot >= 90 && scoring >= 80 && defence >= 70) {
          return "Offensive Threat";
      }

      if (defence >= 90 && speed >= 80 && passing >= 70 && physical >= 70) {
          return "Defensive Captain";
      }

      if (ballHandling >= 90 && speed >= 80 && threePtShot >= 70) {
          return "Ball Handler";
      }

      if (postUp >= 90 && physical >= 80 && defence >= 70) {
          return "Post Anchor";
      }

      // 8. Unique Combinations
      if (speed >= 80 && defence >= 85 && threePtShot >= 80) {
          return "Defensive Sharpshooter";
      }

      if (passing >= 85 && defence >= 80 && scoring >= 75) {
          return "2-Way Playmaker";
      }



      // More Unique Combinations
      if (postUp >= 85 && defence >= 80 && passing >= 75 && height >= 180) {
          return "Playmaking Big Man";
      }

      if (threePtShot >= 85 && speed >= 80 && ballHandling >= 75) {
          return "Quick Sharpshooter";
      }

      if (rebound >= 85 && speed >= 80 && defence >= 75) {
          return "Mobile Glass Cleaner";
      }

      if (ballHandling >= 85 && scoring >= 80 && physical >= 80) {
          return "Power Guard";
      }

      if (defence >= 85 && passing >= 80 && physical >= 75) {
          return "Defensive Quarterback";
      }

      if (physical >= 85 && speed >= 80 && scoring >= 75) {
          return "Athletic Finisher";
      }

      if (passing >= 85 && threePtShot >= 80 && ballHandling >= 75) {
          return "Shooting Playmaker";
      }

      if (scoring >= 85 && defence >= 80 && ballHandling >= 75) {
          return "2-Way Bucket Getter";
      }

      if (rebound >= 85 && postUp >= 80 && threePtShot >= 75) {
          return "Stretch Big";
      }

      if (physical >= 85 && defence >= 80 && threePtShot >= 75) {
          return "Strong Wing Defender";
      }
      if (scoring >= 85 && postUp >= 80 && speed >= 75) {
          return "Mobile Top Scorer";
      }

      if (ballHandling >= 85 && threePtShot >= 80 && defence >= 75) {
          return "Perimeter Threat";
      }

      if (scoring >= 85 && postUp >= 85) {
          return "Post Scorer";
      }

      if (defence >= 85 && passing >= 85 && speed >= 75) {
          return "Lockdown Playmaker";
      }


      if (speed >= 85 && ballHandling >= 85) {
          return "Speedy Playmaker";
      }

      if (rebound >= 85 && defence >= 85) {
          return "Defensive Rebounder";
      }

      if (rebound >= 85 && physical >= 85) {
          return "Rebounding Physical Force";
      }

      if (defence >= 85 && physical >= 85) {
          return "Defensive Beast";
      }

      if (scoring >= 85 && threePtShot >= 85) {
          return "Elite Shooter";
      }



      // 9. Specialized Role Players
      if (threePtShot >= 85 && passing >= 75 && defence >= 70) {
          return "Floor Spacing Sharpshooter";
      }

      if (defence >= 85 && speed >= 75 && rebound >= 70) {
          return "Star Slayer Defender";
      }

      if (scoring >= 85 && speed >= 75 && ballHandling >= 75) {
          return "Go-To Scoring Guard";
      }

      if (rebound >= 85 && physical >= 75 && defence >= 70) {
          return "Glass Cleaner";
      }

      // 10. Focused Builds with Support Stats


      if (passing >= 85 && ballHandling >= 85 && speed >= 75) {
          return "Floor General";
      }

      if (threePtShot >= 80 && scoring >= 75 && speed >= 75) {
          return "Average Shooter";
      }

      if (defence >= 80 && physical >= 80 && passing >= 80) {
          return "Physical Pass-First";
      }

      if (defence >= 80 && physical >= 75 && speed >= 70) {
          return "Physical Defender";
      }

      if (passing >= 80 && ballHandling >= 80 && speed >= 80) {
          return "Fast-Break Playmaker";
      }

      if (passing >= 80 && ballHandling >= 75 && speed >= 70) {
          return "Facilitator";
      }

      if (postUp >= 80 && physical >= 75 && scoring >= 70) {
          return "Inside Scorer";
      }

      // 11. Specialized Single-Stat Focus
      if (threePtShot >= 85 && areOtherStatsInRange('threePtShot', 65, 99)) {
          return "Pure Shooter";
      }

      if (defence >= 85 && areOtherStatsInRange('defence', 65, 99)) {
          return "Defensive Expert";
      }

      if (ballHandling >= 85 && areOtherStatsInRange('ballHandling', 65, 99)) {
          return "Dribbling Specialist";
      }

      if (rebound >= 85 && areOtherStatsInRange('rebound', 65, 99)) {
          return "Rebounding Specialist";
      }

      // 12. Funny Bad Builds

      if (scoring >= 60 && threePtShot < 60 && ballHandling < 60 && defence < 60 && rebound < 60 && speed < 60) {
          return "Brick Specialist";
      }

      if (threePtShot >= 60 && speed < 50 && ballHandling < 50 && passing < 50 && physical < 50) {
          return "Jogging Sharpshooter";
      }

      if (defence >= 60 && physical < 50 && rebound < 50 && speed < 50) {
          return "Defensive Ghost";
      }

      if (rebound >= 60 && scoring < 50 && speed < 50 && defence < 50 && ballHandling < 50) {
          return "Missed Box Out";
      }

      if (physical >= 60 && ballHandling < 50 && passing < 50 && speed < 50) {
          return "Strong Statue";
      }

      if (passing >= 60 && speed < 50 && scoring < 50 && defence < 50) {
          return "Pass to Nowhere";
      }

      if (ballHandling >= 60 && scoring < 50 && passing < 50 && speed < 50) {
          return "Turnover Machine";
      }

      if (ballHandling < 60 && scoring < 60 && passing < 60 && speed < 60, threePtShot < 60, defence < 60, rebound < 60, physical < 60, postUp < 60) {
          return "All-Around Horrible";
      }



      // 13. Role Players
      if (threePtShot >= 80) return "Spot-Up Shooter";
      if (defence >= 80) return "Defensive Role Player";
      if (passing >= 80) return "Pass-First Player";
      if (rebound >= 80) return "Role Rebounder";
      if (speed >= 80) return "Energy Player";
      if (ballHandling >= 80) return "Ball Handler";
      if (physical >= 80) return "Physical Player";
      if (scoring >= 80) return "Scoring Role Player";
      if (postUp >= 80) return "Post-Up Player";




      // 14. Balanced Checks
      const stats_values = Object.values(stats).filter(stat => typeof stat === 'number');
      const avg = stats_values.reduce((a, b) => a + b, 0) / stats_values.length;
      if (stats_values.every(stat => Math.abs(stat - avg) < 10)) {
          if (avg >= 85) return "Elite All-Around";
          if (avg >= 75) return "Solid All-Around";
          if (avg >= 65) return "Balanced Role Player";
      }

      return "Role Player";
  };

  if (sport === 'Football') {
      const {
          finishing,
          passing,
          speed,
          physical,
          defence,
          dribbling,
          stamina
      } = stats;


      // 0. Player Name's and Special Tier
      if (finishing >= 90 && areOtherStatsInRange('finishing', 0, 70)) {
          return "Eran Levi Build";
      }

      // 1. GOAT Tier
      if (Object.values(stats).every(stat => typeof stat === 'number' && stat >= 95)) {
          return "GOAT";
      }

      // 2. Legendary Tier
      if (Object.values(stats).every(stat => typeof stat === 'number' && stat >= 90)) {
          return "Legendary Complete Player";
      }



      // 3. Elite Mixed-Rating Combinations
      if (finishing >= 90 && speed >= 90 && dribbling >= 85 && stamina >= 85) {
          return "Elite Complete Forward";
      }

      if (passing >= 90 && dribbling >= 90 && speed >= 85 && stamina >= 85) {
          return "Elite Playmaker";
      }

      if (finishing >= 90 && passing >= 90 && dribbling >= 90 && speed >= 85) {
          return "Elite Complete Attacker";
      }

      if (defence >= 90 && physical >= 90 && stamina >= 85 && passing >= 85) {
          return "Elite Complete Defender";
      }

      // 4. Specialized High-Tier Builds


      if (passing >= 90 && dribbling >= 85 && stamina >= 80) {
          return "Midfield Maestro";
      }

      if (finishing >= 90 && dribbling >= 85 && speed >= 80) {
          return "Go-To Striker";
      }

      if (defence >= 90 && physical >= 85 && speed >= 80) {
          return "Defensive Wall";
      }

      // 5. Mixed High-Mid Tier Combinations
      if (speed >= 90 && dribbling >= 85 && finishing >= 80) {
          return "Explosive Attacker";
      }

      if (passing >= 90 && stamina >= 85 && defence >= 80) {
          return "Deep-Passing Commander";
      }

      if (physical >= 90 && defence >= 85 && passing >= 75) {
          return "Ball-Playing Defender";
      }

      // 6. Strong Three-Stat Combinations
      if (stamina >= 85 && passing >= 85 && defence >= 85 && dribbling >= 80) {
          return "Box-to-Box Engine";
      }

      if (dribbling >= 85 && speed >= 85 && finishing >= 85) {
          return "Technical Forward";
      }

      if (defence >= 85 && physical >= 85 && speed >= 85) {
          return "Athletic Defender";
      }
      if (passing >= 85 && dribbling >= 85 && finishing >= 85) {
          return "Playmaking Finisher";
      }

      if (speed >= 85 && physical >= 85) {
          return "Powerful Sprinter";
      }

      if (finishing >= 85 && speed >= 85) {
          return "Fast Finisher";
      }

      if (passing >= 85 && stamina >= 85) {
          return "Endurance Playmaker";
      }

      // 7. Specialized Role Combinations
      if (defence >= 85 && physical >= 85 && stamina >= 75) {
          return "Iron Wall";
      }

      if (finishing >= 85 && physical >= 80 && stamina >= 75) {
          return "Target Forward";
      }

      if (dribbling >= 85 && passing >= 80 && stamina >= 75) {
          return "Creative Midfielder";
      }

      if (speed >= 90 && stamina >= 80 && dribbling >= 75) {
          return "Explosive Winger";
      }

      // 8. Technical Specialists
      if (dribbling >= 85 && speed >= 80 && passing >= 70) {
          return "Technical Winger";
      }

      if (passing >= 85 && dribbling >= 80 && stamina >= 70) {
          return "Deep Playmaker";
      }

      if (finishing >= 85 && dribbling >= 80 && speed >= 70) {
          return "Clinical Striker";
      }



      // 9. Mixed-Rating Role Players
      if (defence >= 80 && stamina >= 75 && passing >= 70) {
          return "Holding Midfielder";
      }

      if (speed >= 80 && passing >= 75 && stamina >= 70) {
          return "Wing Back";
      }

      if (finishing >= 80 && speed >= 75 && dribbling >= 70) {
          return "Mobile Forward";
      }

      // 10. Specialized Single-Stat Focus
      if (finishing >= 85 && areOtherStatsInRange('finishing', 65, 99)) {
          return "Pure Finisher";
      }

      if (dribbling >= 85 && areOtherStatsInRange('dribbling', 65, 99)) {
          return "Dribbling Specialist";
      }

      if (defence >= 85 && areOtherStatsInRange('defence', 65, 99)) {
          return "Defensive Specialist";
      }

      // 11. Support Role Players
      if (passing >= 80 && areOtherStatsInRange('passing', 65, 99)) {
          return "Supporting Playmaker";
      }

      if (stamina >= 80 && areOtherStatsInRange('stamina', 65, 99)) {
          return "Tireless Runner";
      }

      if (physical >= 80 && areOtherStatsInRange('physical', 65, 99)) {
          return "Physical Presence";
      }

      // 12. Basic Role Specialists
      if (finishing >= 75) return "Poacher";
      if (passing >= 75) return "Ball Distributor";
      if (defence >= 75) return "Defensive Cover";
      if (dribbling >= 75) return "Ball Carrier";
      if (speed >= 75) return "Speedster";
      if (stamina >= 75) return "Marathon Man";
      if (physical >= 75) return "Physical Player";

      // 13. Balanced Checks
      const stats_values = Object.values(stats).filter(stat => typeof stat === 'number');
      const avg = stats_values.reduce((a, b) => a + b, 0) / stats_values.length;
      if (stats_values.every(stat => Math.abs(stat - avg) < 10)) {
          if (avg >= 85) return "Elite All-Around";
          if (avg >= 75) return "Complete Team Player";
          if (avg >= 65) return "Balanced Squad Player";
      }

      return "Squad Player";
  };
};

export default {
  determinePlayerBuild
};