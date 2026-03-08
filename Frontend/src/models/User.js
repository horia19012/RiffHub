export class User {
  constructor({
    id        = crypto.randomUUID(),
    username  = '',
    email     = '',
    riffs     = [],
    comments  = [],
    reactions = [],
    friends   = [],
  } = {}) {
    this.id        = id;
    this.username  = username;
    this.email     = email;
    this.riffs     = riffs;
    this.comments  = comments;
    this.reactions = reactions;
    this.friends   = friends;
  }

  static fromJSON(json) {
    return new User({
      id:        json.id,
      username:  json.username,
      email:     json.email,
      riffs:     json.riffs     ?? [],
      comments:  json.comments  ?? [],
      reactions: json.reactions ?? [],
      friends:   (json.friends  ?? []).map(f => User.fromJSON(f)),
    });
  }

  toJSON() {
    return { id: this.id, username: this.username, email: this.email };
  }

  static toRegisterPayload(username, email, password) {
    return { username, email, password };
  }
}

export default User;