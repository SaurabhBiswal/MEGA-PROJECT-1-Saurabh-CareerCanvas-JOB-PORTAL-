import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  resume: { type: String },
  image: { type: String, required: true },
  headline: { type: String, default: "" },      // e.g. "Senior MERN Developer"
  portfolio: { type: String, default: "" },     // Website link
  skills: { type: Array, default: [] },         // Skills list
  location: { type: String, default: "" }
});

const User = mongoose.model("User", userSchema);

export default User;