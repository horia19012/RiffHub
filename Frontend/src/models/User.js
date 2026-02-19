
export class User {
  /**
   * @param {Object} data
   * @param {string}   data.id       
   * @param {string}   data.username
   * @param {string}   data.email
   * @param {string}   [data.password] 
   * @param {Riff[]}   [data.riffs]
   * @param {Comment[]}  [data.comments]
   * @param {Reaction[]} [data.reactions]
   * @param {User[]}   [data.friends]
   */
  constructor({
    id         = crypto.randomUUID(),
    username   = '',
    email      = '',
    password   = '',
    riffs      = [],
    comments   = [],
    reactions  = [],
    friends    = [],
  } = {}) {
    this.id        = id;
    this.username  = username;
    this.email     = email;
    this.password  = password;   
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
    return {
      id:        this.id,
      username:  this.username,
      email:     this.email,
    };
  }

  toRegisterPayload() {
    return {
      username: this.username,
      email:    this.email,
      password: this.password,
    };
  }
}

export default User;