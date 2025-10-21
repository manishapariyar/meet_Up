
import { findByUsername, createUser } from '../../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { find, save, update, revoke } from '../../models/RefreshToken.js';
const login = async (req, res) => {
  // Login logic here
  try {
    let { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "All fields are required" })
    }
    const user = await findByUsername(username);
    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const foundUser = user[0];

    const passwordMatch = await bcrypt.compare(password, foundUser.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" })
    }


    const payload = {
      user_id: foundUser.user_id,
      username: foundUser.username,
      email: foundUser.email
    };

    const access_token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })
    const refresh_token = jwt.sign(payload, process.env.REFRESH_SECRET, { expiresIn: process.env.REFRESH_EXPIRES_IN })



    return res.status(200).json({
      message: "Login successful",
      access_token,
      refresh_token,
      user: {
        id: foundUser.user_id,
        username: foundUser.username,
        email: foundUser.email
      }
    });


  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" })

  }
}


const signup = async (req, res) => {
  // Signup logic here
  try {
    let { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" })
    }
    const existingUser = await findByUsername(username);
    if (existingUser.length > 0) {
      return res.status(409).json({ message: "Username already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await createUser(username, email, hashedPassword);
    return res.status(201).json({ message: "User created successfully", userId: newUser.insertId });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" })
  }
}

const refreshToken = async (req, res,) => {
  try {
    //find the refresh token in db
    const { refresh_token } = find(req.body.refresh_token);
    if (!refresh_token) {
      return res.status(403).json({ message: "Refresh token not found, login again" })
    }
    //verify the refresh token
    const { user_id, username, email } = jwt.verify(refresh_token, process.env.REFRESH_SECRET);

    //check if the user with the extracted userid exists or not
    const user = await findByUsername(username);
    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" })
    }

    //generate new tokens
    let new_access_token = jwt.sign({ user_id, username, email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    let new_refresh_token = jwt.sign({ user_id, username, email }, process.env.REFRESH_SECRET, { expiresIn: process.env.REFRESH_EXPIRES_IN });

    return res.status(200).json({
      access_token: new_access_token,
      refresh_token: new_refresh_token
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}


const logout = (req, res) => {
  // Logout logic here
  const refresh_token = req.body.refresh_token;
  try {
    let deletedToken = revoke(refresh_token);
    return res.status(200).json({ message: "Logged out successfully" });
  }
  catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });

  }
}

export {
  login,
  signup,
  refreshToken,
  logout
}