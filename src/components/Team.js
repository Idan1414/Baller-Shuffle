class Team {
  constructor(teamPlayers) {
    this.num_of_players = teamPlayers.length;
    this.team_id = generateUniqueId();
    this.players = teamPlayers;
    this.team_overall = 0;
    this.team_threePtShot = 0;
    this.team_defence = 0;
    this.team_height = 0;
  }

  calculateTeamStats() {
    // Calculate averages for overall, threePtShot, defence, and height
    const sumOverall = this.players.reduce((sum, player) => sum + player.overall, 0);
    const sumThreePtShot = this.players.reduce((sum, player) => sum + player.threePtShot, 0);
    const sumDefence = this.players.reduce((sum, player) => sum + player.defence, 0);
    const sumHeight = this.players.reduce((sum, player) => sum + player.height, 0);
    this.num_of_players = this.players.length;
    this.team_overall = Math.round(sumOverall / this.num_of_players);
    this.team_threePtShot = Math.round(sumThreePtShot / this.num_of_players);
    this.team_defence = Math.round(sumDefence / this.num_of_players);
    this.team_height = Math.round(sumHeight / this.num_of_players);
  }
}

function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9);
}

export default Team;
