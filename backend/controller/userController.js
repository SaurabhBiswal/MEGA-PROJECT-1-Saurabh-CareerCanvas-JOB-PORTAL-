import User from "../models/User.js";

import JobApplication from "../models/JobApplication.js";

import Job from "../models/Job.js";

import { v2 as cloudinary } from "cloudinary";



// --- GET USER DATA (With Auto-Registration) ---

export const getUserData = async (req, res) => {

  try {

    // Clerk deprecation warning fix: function call ka use kiya hai

    const userId = typeof req.auth === 'function' ? req.auth().userId : req.auth.userId;



    let user = await User.findById(userId);



    // Agar database mein user nahi hai, toh turant create karo (Fixes "User not found")

    if (!user) {

      console.log("User not found in DB, creating new profile...");

      user = await User.create({

        _id: userId,

        name: "User_" + userId.slice(-4), // Temporary name

        email: "pending@Saurabh's CareerCanvas.com",

        image: "https://via.placeholder.com/150",

        headline: "", // Empty taaki onboarding trigger ho

        portfolio: "",

        skills: [],

      });

    }



    res.json({ success: true, user });

  } catch (error) {

    console.log("Error in getUserData:", error.message);

    res.json({ success: false, message: error.message });

  }

};



// --- APPLY FOR A JOB ---

export const applyForJob = async (req, res) => {

  try {

    const { jobId } = req.body;

    const userId = typeof req.auth === 'function' ? req.auth().userId : req.auth.userId;



    const isAlreadyApplied = await JobApplication.findOne({ userId, jobId });



    if (isAlreadyApplied) {

      return res.json({ success: false, message: "You have already applied for this job" });

    }



    const jobData = await Job.findById(jobId);



    if (!jobData) {

      return res.json({ success: false, message: "Job not found" });

    }



    await JobApplication.create({

      companyId: jobData.companyId,

      userId,

      jobId,

      date: Date.now(),

    });



    res.json({ success: true, message: "Applied Successfully" });

  } catch (error) {

    res.json({ success: false, message: error.message });

  }

};



// --- GET APPLIED APPLICATIONS ---

export const getUserJobApplications = async (req, res) => {

  try {

    const userId = typeof req.auth === 'function' ? req.auth().userId : req.auth.userId;



    const applications = await JobApplication.find({ userId })

      .populate("companyId", "name email image")

      .populate("jobId", "title description location level salary")

      .exec();



    return res.json({ success: true, applications });

  } catch (error) {

    res.json({ success: false, message: error.message });

  }

};



// --- UPDATE PROFESSIONAL PROFILE & RESUME ---

export const updateUserProfile = async (req, res) => {

  try {

    const userId = typeof req.auth === 'function' ? req.auth().userId : req.auth.userId;

    const { headline, portfolio, skills, phone, location } = req.body;

    const resumeFile = req.file;



    const userData = await User.findById(userId);



    if (!userData) {

      return res.json({ success: false, message: "User profile missing" });

    }



    // Resume handling via Cloudinary

    if (resumeFile) {

      const resumeUpload = await cloudinary.uploader.upload(resumeFile.path, {

        resource_type: "raw",

      });

      userData.resume = resumeUpload.secure_url;

    }



    // Professional fields update

    if (headline) userData.headline = headline;

    if (portfolio) userData.portfolio = portfolio;

    if (location) userData.location = location;

    if (phone) userData.phone = phone;

   

    // Skills handling (comma string to array)

    if (skills) {

      try {

        userData.skills = JSON.parse(skills);

      } catch (e) {

        userData.skills = skills.split(',').map(s => s.trim());

      }

    }



    await userData.save();



    return res.json({

      success: true,

      message: "Profile Updated Successfully",

      user: userData

    });



  } catch (error) {

    console.log("Error updating profile:", error.message);

    res.json({ success: false, message: error.message });

  }

};