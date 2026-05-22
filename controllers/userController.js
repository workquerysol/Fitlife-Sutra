import asyncHandler from "express-async-handler"
import crypto from "crypto"
import User from "../models/userModel.js"
import generateToken from "../utils/generateToken.js"
import { badRequest, conflict, notFound, unauthorized } from "../utils/apiError.js"
import { sendSuccess } from "../utils/apiResponse.js"
import sendPasswordResetEmail from "../utils/sendPasswordResetEmail.js"
import Membership from "../models/membership.js"
import Attendance from "../models/attendance.js"
import HealthEvaluation from "../models/healthEvaluations.js"

const buildUserPayload = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
})

const hashResetToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex")

// @desc user token
// route /api/users/login
// @method post
const loginUser = asyncHandler(async (req, res) => {
  const email = req.body.email?.trim().toLowerCase()
  const password = req.body.password

  if (!email || !password) {
    throw badRequest("Email and password are required")
  }

  const user = await User.findOne({ email })

  if (user && (await user.matchPassword(password))) {
    const token = generateToken(res, user._id)

    return sendSuccess(res, {
      statusCode: 200,
      message: "User authenticated successfully",
      data: {
        user: buildUserPayload(user),
        token,
      },
    })
  }

  throw unauthorized("Invalid email or password")
})

// @desc register user
// route /api/users
// @method post
const registerUser = asyncHandler(async (req, res) => {
  // #swagger.tags = ['Users']
  const name = req.body.name?.trim()
  const email = req.body.email?.trim().toLowerCase()
  const password = req.body.password

  if (!name || !email || !password) {
    throw badRequest("Name, email, and password are required")
  }

  const userExists = await User.findOne({ email })

  if (userExists) {
    throw conflict("User already exists")
  }

  const user = await User.create({
    name,
    email,
    password,
  })

  const token = generateToken(res, user._id)

  return sendSuccess(res, {
    statusCode: 201,
    message: "User registered successfully",
    data: {
      user: buildUserPayload(user),
      token,
    },
  })
})

// @desc logout user
// route /api/users/logout
// @method post
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  })

  return sendSuccess(res, {
    message: "User logged out successfully",
  })
})

// @desc get user profile
// route /api/users/profile
// @method get
const getUserProfile = asyncHandler(async (req, res) => {
  return sendSuccess(res, {
    message: "User profile fetched successfully",
    data: {
      user: buildUserPayload(req.user),
    },
  })
})

// @desc get user dashboard details
// route /api/users/dashboard
// @method get
const getUserDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id

  const membership = await Membership.findOne({ user_id: userId }).sort({ createdAt: -1 })

  const month = parseInt(req.query.month) || new Date().getMonth() + 1
  const year = parseInt(req.query.year) || new Date().getFullYear()

  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59, 999)

  const attendance = await Attendance.find({
    user_id: userId,
    attandanceDate: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ attandanceDate: 1 })

  return sendSuccess(res, {
    message: "User dashboard fetched successfully",
    data: {
      membership,
      attendance,
    },
  })
})

// @desc update user profile
// route /api/users/profile
// @method put
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (!user) {
    throw notFound("User not found")
  }

  const nextName = req.body.name?.trim()
  const nextEmail = req.body.email?.trim().toLowerCase()
  const nextPassword = req.body.password

  if (nextEmail && nextEmail !== user.email) {
    const existingUser = await User.findOne({ email: nextEmail })

    if (existingUser) {
      throw conflict("Email is already in use")
    }
  }

  user.name = nextName || user.name
  user.email = nextEmail || user.email

  if (nextPassword) {
    user.password = nextPassword
  }

  const updatedUser = await user.save()

  return sendSuccess(res, {
    message: "User profile updated successfully",
    data: {
      user: buildUserPayload(updatedUser),
    },
  })
})

// @desc request password reset email
// route /api/users/forgot-password
// @method post
const forgotPassword = asyncHandler(async (req, res) => {
  const email = req.body.email?.trim().toLowerCase()

  if (!email) {
    throw badRequest("Email is required")
  }

  const user = await User.findOne({ email })

  if (user) {
    const resetToken = crypto.randomBytes(32).toString("hex")

    user.resetPasswordToken = hashResetToken(resetToken)
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000
    await user.save({ validateBeforeSave: false })

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173"
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`

    try {
      await sendPasswordResetEmail({
        email: user.email,
        name: user.name,
        resetUrl,
      })
    } catch (error) {
      user.resetPasswordToken = undefined
      user.resetPasswordExpires = undefined
      await user.save({ validateBeforeSave: false })
      throw error
    }
  }

  return sendSuccess(res, {
    message: "If an account exists for that email, a password reset link has been sent",
  })
})

// @desc reset password
// route /api/users/reset-password/:token
// @method post
const resetPassword = asyncHandler(async (req, res) => {
  const password = req.body.password
  const token = req.params.token

  if (!password) {
    throw badRequest("Password is required")
  }

  if (!token) {
    throw badRequest("Reset token is required")
  }

  const user = await User.findOne({
    resetPasswordToken: hashResetToken(token),
    resetPasswordExpires: { $gt: Date.now() },
  })

  if (!user) {
    throw badRequest("Password reset link is invalid or has expired")
  }

  user.password = password
  user.resetPasswordToken = undefined
  user.resetPasswordExpires = undefined
  await user.save()

  return sendSuccess(res, {
    message: "Password reset successfully",
  })
})

// @desc    Get all members with pagination, search, and filters (Admin)
// @route   GET /api/v1/users/members
// @access  Admin
const getAllMembers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 20
  const skip = (page - 1) * limit

  const search = req.query.search?.trim()
  const planType = req.query.planType
  const status = req.query.status // ACTIVE, EXPIRED, PAUSED
  const sortBy = req.query.sortBy || "createdAt"
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1

  // Build user query
  let userQuery = { role: "user", isDeleted: { $ne: true } }

  if (search) {
    const searchRegex = new RegExp(search, "i")
    userQuery.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
    ]
  }

  // Get total count for pagination
  const totalMembers = await User.countDocuments(userQuery)

  // Get paginated users
  const users = await User.find(userQuery)
    .select("-password -resetPasswordToken -resetPasswordExpires")
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit)
    .lean()

  // Get latest membership for each user in one query
  const userIds = users.map(u => u._id)
  const memberships = await Membership.aggregate([
    { $match: { user_id: { $in: userIds } } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$user_id",
        latestMembership: { $first: "$$ROOT" }
      }
    }
  ])

  // Build a membership lookup map
  const membershipMap = {}
  memberships.forEach(m => {
    membershipMap[m._id.toString()] = m.latestMembership
  })

  // Merge user data with membership data
  const members = users.map(user => {
    const membership = membershipMap[user._id.toString()]
    return {
      ...user,
      membership: membership
        ? {
            _id: membership._id,
            planType: membership.planType,
            status: membership.status,
            startDate: membership.startDate,
            endDate: membership.endDate,
            paymentStatus: membership.paymentStatus,
          }
        : null,
    }
  })

  // Apply post-query filters (on membership fields)
  let filteredMembers = members
  if (planType) {
    filteredMembers = filteredMembers.filter(
      m => m.membership?.planType?.toLowerCase() === planType.toLowerCase()
    )
  }
  if (status) {
    filteredMembers = filteredMembers.filter(
      m => m.membership?.status === status
    )
  }

  const totalPages = Math.ceil(totalMembers / limit)

  return sendSuccess(res, {
    message: "Members fetched successfully",
    data: {
      members: filteredMembers,
      pagination: {
        currentPage: page,
        totalPages,
        totalMembers,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
  })
})

// @desc    Get a single member's full admin profile
// @route   GET /api/v1/users/members/:id
// @access  Admin
const getMemberProfile = asyncHandler(async (req, res) => {
  const { id } = req.params

  const user = await User.findById(id)
    .select("-password -resetPasswordToken -resetPasswordExpires")
    .lean()

  if (!user) {
    throw notFound("Member not found")
  }

  // Get active membership (or latest)
  const membership = await Membership.findOne({ user_id: id })
    .sort({ createdAt: -1 })
    .lean()

  // Compute cycle info
  let cycleInfo = null
  if (membership) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const cycleStart = new Date(membership.startDate)
    const cycleEnd = new Date(membership.endDate)
    const totalDays = membership.durationDays + (membership.rolloverDays || 0)

    const elapsedMs = today.getTime() - cycleStart.getTime()
    const dayInCycle = Math.min(totalDays, Math.max(1, Math.ceil(elapsedMs / (1000 * 60 * 60 * 24)) + 1))

    const remainingMs = cycleEnd.getTime() - today.getTime()
    const daysLeft = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)))

    cycleInfo = {
      totalDays,
      dayInCycle,
      daysLeft,
      rolloverDays: membership.rolloverDays || 0,
      sessionsCompleted: membership.attendanceUsed || 0,
    }
  }

  // Get latest health evaluation
  const latestEvaluation = await HealthEvaluation.findOne({ userId: id })
    .sort({ evaluationDate: -1 })
    .lean()

  return sendSuccess(res, {
    message: "Member profile fetched successfully",
    data: {
      user,
      membership,
      cycleInfo,
      latestEvaluation,
    },
  })
})

export {
  loginUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
  getUserDashboard,
  getAllMembers,
  getMemberProfile,
}
