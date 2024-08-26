class Court {
  constructor({ courtName, id, courtType, players}) {
    this.courtName = courtName || '';
    this.id = id || '';
    this.courtType = courtType || '';
    this.players = players || [];
  }
}

export default Court;
