class Team {
  constructor(teamPlayers = [], teamId = generateUniqueId()) {
    this.num_of_players = teamPlayers.length;
    this.team_id = generateUniqueId();
    this.players = teamPlayers;
    this.team_overall = 0;
    this.team_threePtShot = 0;
    this.team_defence = 0;
    this.team_height = 0;
    this.team_scoring = 0;
    this.team_passing = 0;
    this.team_speed = 0;
    this.team_physical = 0;
    this.team_rebound = 0;
    this.team_ballHandling = 0;
    this.team_postUp = 0;

    if (this.players.length > 0) {
      this.calculateTeamStats();
    }
  }

  calculateTeamStats() {
    // Calculate averages for overall, threePtShot, defence, height, and other attributes
    const sumOverall = this.players.reduce((sum, player) => sum + player.overall, 0);
    const sumThreePtShot = this.players.reduce((sum, player) => sum + player.threePtShot, 0);
    const sumDefence = this.players.reduce((sum, player) => sum + player.defence, 0);
    const sumHeight = this.players.reduce((sum, player) => sum + player.height, 0);

    // Calculate sum for other attributes
    const sumScoring = this.players.reduce((sum, player) => sum + player.scoring, 0);
    const sumPassing = this.players.reduce((sum, player) => sum + player.passing, 0);
    const sumSpeed = this.players.reduce((sum, player) => sum + player.speed, 0);
    const sumPhysical = this.players.reduce((sum, player) => sum + player.physical, 0);
    const sumRebound = this.players.reduce((sum, player) => sum + player.rebound, 0);
    const sumBallHandling = this.players.reduce((sum, player) => sum + player.ballHandling, 0);
    const sumPostUp = this.players.reduce((sum, player) => sum + player.postUp, 0);

    this.num_of_players = this.players.length;
    this.team_overall = Math.round(sumOverall / this.num_of_players);
    this.team_threePtShot = Math.round(sumThreePtShot / this.num_of_players);
    this.team_defence = Math.round(sumDefence / this.num_of_players);
    this.team_height = Math.round(sumHeight / this.num_of_players);

    // Calculate averages for other attributes
    this.team_scoring = Math.round(sumScoring / this.num_of_players);
    this.team_passing = Math.round(sumPassing / this.num_of_players);
    this.team_speed = Math.round(sumSpeed / this.num_of_players);
    this.team_physical = Math.round(sumPhysical / this.num_of_players);
    this.team_rebound = Math.round(sumRebound / this.num_of_players);
    this.team_ballHandling = Math.round(sumBallHandling / this.num_of_players);
    this.team_postUp = Math.round(sumPostUp / this.num_of_players);
  }
}



function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9);
}

export default Team;
