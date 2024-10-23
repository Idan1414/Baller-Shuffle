class FootballTeam {
  constructor(teamPlayers = []) {
    this.num_of_players = teamPlayers.length;
    this.players = teamPlayers;
    this.team_overall = 0;
    this.team_defence = 0;
    this.team_finishing = 0;
    this.team_passing = 0;
    this.team_speed = 0;
    this.team_physical = 0;
    this.team_dribbling = 0;
    this.team_header = 0;

    // Automatically calculate stats if players are provided
    if (this.players.length > 0) {
      this.calculateTeamStats();
    }
  }

  calculateTeamStats() {
    // Calculate averages for overall, threePtShot, defence, height, and other attributes
    const sumOverall = this.players.reduce((sum, player) => sum + player.overall, 0);
    const sumDefence = this.players.reduce((sum, player) => sum + player.defence, 0);
    // Calculate sum for other attributes
    const sumFinishing = this.players.reduce((sum, player) => sum + player.finishing, 0);
    const sumPassing = this.players.reduce((sum, player) => sum + player.passing, 0);
    const sumSpeed = this.players.reduce((sum, player) => sum + player.speed, 0);
    const sumPhysical = this.players.reduce((sum, player) => sum + player.physical, 0);
    const sumDribbling = this.players.reduce((sum, player) => sum + player.dribbling, 0);
    const sumHeader = this.players.reduce((sum, player) => sum + player.header, 0);

    this.num_of_players = this.players.length;
    this.team_overall = Math.round(sumOverall / this.num_of_players);
    this.team_defence = Math.round(sumDefence / this.num_of_players);
    // Calculate averages for other attributes
    this.team_finishing = Math.round(sumFinishing / this.num_of_players);
    this.team_passing = Math.round(sumPassing / this.num_of_players);
    this.team_speed = Math.round(sumSpeed / this.num_of_players);
    this.team_physical = Math.round(sumPhysical / this.num_of_players);
    this.team_dribbling = Math.round(sumDribbling / this.num_of_players);
    this.team_header = Math.round(sumHeader / this.num_of_players);
  }
}



function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9);
}

export default FootballTeam;
