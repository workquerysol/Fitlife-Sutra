import jwt from "jsonwebtoken"
import asyncHandler from "express-async-handler"
import User from "../models/userModel.js"
import { unauthorized } from "../utils/apiError.js"

const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies.jwt

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      req.user = await User.findById(decoded.userId).select("-password")

      if (!req.user) {
        throw unauthorized("User linked to this token no longer exists")
      }

      next()
    } catch (error) {
      throw unauthorized("Invalid or expired token")
    }
  } else {
    throw unauthorized("Not authorized, token missing")
  }
})

export { protect }
