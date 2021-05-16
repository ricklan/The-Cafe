class UserDemograpic {
  age: number;
  ethnicity: string;
  gender: string;
  interests: string[];
  language: string;
  location: string;
  constructor({ age, ethnicity, gender, interests, language, location }) {
    this.age = age;
    this.ethnicity = ethnicity;
    this.gender = gender;
    this.interests = interests;
    this.language = language;
    this.location = location;
  }
}
exports.UserDemograpic = UserDemograpic;
