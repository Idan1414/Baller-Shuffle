class BasketballPlayer {
  constructor({ name, photo, scoring, passing, speed, physical, defence, threePtShot, rebound, ballHandling, postUp, height, id, overall, overallToMix }) {
    this.name = name || '';
    this.photo = photo || 'public/logo512.png';
    this.scoring = scoring || 0;
    this.passing = passing || 0;
    this.speed = speed || 0;
    this.physical = physical || 0;
    this.defence = defence || 0;
    this.threePtShot = threePtShot || 0;
    this.rebound = rebound || 0;
    this.ballHandling = ballHandling || 0;
    this.postUp = postUp || 0;
    this.height = height || 0;
    this.id = id || ''; // Make sure id is handled properly
    this.overall = overall || 0;
    this.overallToMix = overallToMix || 0;
  }
}

export default BasketballPlayer;
