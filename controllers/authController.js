const jwt = require("jsonwebtoken");
const User = require("../model/user");

// handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: "", password: "" };

  // incorrect email
  if (err.message === "Incorrect email") {
    errors.email = "That email is not registered";
  }

  // incorrect password
  if (err.message === "Incorrect password") {
    errors.password = "That password is incorrect";
  }

  // duplicate email error
  if (err.code === 11000) {
    errors.email = "that email is already registered";
    return errors;
  }

  // validation errors
  if (err.message.includes("user validation failed")) {
    // console.log(err);
    Object.values(err.errors).forEach(({ properties }) => {
      // console.log(val);
      // console.log(properties);
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

const maxAge = 3 * 24 * 60 * 60 * 1000;
const createToken = (id) => {
  const payload = { id: id.toString() };
  return jwt.sign(payload, "hello my name is purvil, this is my secret key", {
    expiresIn: 3 * 24 * 60 * 60,
  });
};

const signup_get = (req, res) => {
  res.render("signup");
};
const login_get = (req, res) => {
  res.render("login");
};

const signup_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.create({ email, password });
    const token = createToken(user._id);
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({ user });
    // res.status(201).json({ user: user._id });
  } catch (err) {
    res.status(400).json(handleErrors(err));
  }
};

const login_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ user });
  } catch (err) {
    res.status(400).json(handleErrors(err));
  }
};
const logout_get = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};

module.exports = { signup_get, signup_post, login_get, login_post, logout_get };
