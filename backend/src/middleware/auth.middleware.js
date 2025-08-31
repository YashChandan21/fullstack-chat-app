import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { verifyFirebaseToken } from "../lib/firebase.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    const firebaseToken = req.headers.authorization?.split(' ')[1]; // Bearer token

    if (!token && !firebaseToken) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    let user = null;

    // Try Firebase token first
    if (firebaseToken) {
      try {
        const decodedFirebase = await verifyFirebaseToken(firebaseToken);
        user = await User.findOne({ firebaseUid: decodedFirebase.uid }).select("-password");
        
        if (!user) {
          return res.status(404).json({ message: "Firebase user not found in database" });
        }
      } catch (firebaseError) {
        // If Firebase token fails, try JWT token
        if (!token) {
          return res.status(401).json({ message: "Unauthorized - Invalid Firebase Token" });
        }
      }
    }

    // Try JWT token if Firebase failed or wasn't provided
    if (!user && token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (!decoded) {
          return res.status(401).json({ message: "Unauthorized - Invalid JWT Token" });
        }

        user = await User.findById(decoded.userId).select("-password");
        
        if (!user) {
          return res.status(404).json({ message: "JWT user not found" });
        }
      } catch (jwtError) {
        return res.status(401).json({ message: "Unauthorized - Invalid JWT Token" });
      }
    }

    if (!user) {
      return res.status(401).json({ message: "Unauthorized - No valid authentication found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
