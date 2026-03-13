const Campus = require('../models/Campus');
const User = require('../models/User');

// @desc    Get all campuses
// @route   GET /api/campuses
// @access  Public
const getCampuses = async (req, res) => {
  try {
    const campuses = await Campus.find()
      .sort({ totalDonors: -1 })
      .select('-registeredStudents');

    res.json(campuses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single campus by ID
// @route   GET /api/campuses/:id
// @access  Public
const getCampusById = async (req, res) => {
  try {
    const campus = await Campus.findById(req.params.id).populate(
      'registeredStudents',
      'name email bloodGroup donationCount'
    );

    if (!campus) {
      return res.status(404).json({ message: 'Campus not found' });
    }

    res.json(campus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new campus
// @route   POST /api/campuses
// @access  Public
const createCampus = async (req, res) => {
  try {
    const { collegeName, city, state } = req.body;

    // Check if campus already exists
    const campusExists = await Campus.findOne({ collegeName });

    if (campusExists) {
      return res.status(400).json({ message: 'Campus already exists' });
    }

    const campus = await Campus.create({
      collegeName,
      city,
      state,
    });

    res.status(201).json(campus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join a campus
// @route   POST /api/campuses/join
// @access  Private
const joinCampus = async (req, res) => {
  try {
    const { campusId } = req.body;
    const userId = req.user._id;

    // Find campus
    const campus = await Campus.findById(campusId);

    if (!campus) {
      return res.status(404).json({ message: 'Campus not found' });
    }

    // Check if user already joined this campus
    if (campus.registeredStudents.includes(userId)) {
      return res.status(400).json({ message: 'Already joined this campus' });
    }

    // Check if user is already part of another campus
    const user = await User.findById(userId);
    if (user.campus) {
      return res.status(400).json({
        message: 'You are already part of another campus. Leave it first.',
      });
    }

    // Add user to campus
    campus.registeredStudents.push(userId);
    campus.totalDonors += 1;
    await campus.save();

    // Update user's campus
    user.campus = campusId;
    await user.save();

    res.json({
      message: 'Successfully joined campus',
      campus: {
        _id: campus._id,
        collegeName: campus.collegeName,
        city: campus.city,
        state: campus.state,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Leave a campus
// @route   POST /api/campuses/leave
// @access  Private
const leaveCampus = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find user
    const user = await User.findById(userId);

    if (!user.campus) {
      return res.status(400).json({ message: 'You are not part of any campus' });
    }

    // Find campus
    const campus = await Campus.findById(user.campus);

    if (campus) {
      // Remove user from campus
      campus.registeredStudents = campus.registeredStudents.filter(
        (studentId) => studentId.toString() !== userId.toString()
      );
      campus.totalDonors = Math.max(0, campus.totalDonors - 1);
      await campus.save();
    }

    // Remove campus from user
    user.campus = null;
    await user.save();

    res.json({ message: 'Successfully left campus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's campus
// @route   GET /api/campuses/my-campus
// @access  Private
const getMyCampus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('campus');

    if (!user.campus) {
      return res.status(404).json({ message: 'Not part of any campus' });
    }

    res.json(user.campus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCampuses,
  getCampusById,
  createCampus,
  joinCampus,
  leaveCampus,
  getMyCampus,
};
