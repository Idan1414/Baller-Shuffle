class FootballPlayer {
  constructor({ name, photo, finishing, passing, speed, physical, defence, dribbling,header, id, overall, overallToMix }) {
    this.name = name || '';
    this.photo = photo || 'public/logo512.png';
    this.finishing = finishing || 0;
    this.passing = passing || 0;
    this.speed = speed || 0;
    this.physical = physical || 0;
    this.defence = defence || 0;
    this.dribbling = dribbling || 0;
    this.header = header || 0;
    this.id = id || ''; // Make sure id is handled properly
    this.overall = overall || 0;
    this.overallToMix = overallToMix || 0;
  }
}

export default FootballPlayer;
