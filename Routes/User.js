let userModel = require("../Schemas/Users");
let router = require("express").Router();

// register user
router.post("/register", async (req, res) => {
  let userData = req.body;
  let newUser = new userModel({
    name: userData.name,
    mobile: userData.mobile,
  });

  try {
    let savedUser = await newUser.save();
    let res_data = {
      id: savedUser._id,
      name: savedUser.name,
      mobile: savedUser.mobile,
    };
    return res.status(200).json(res_data);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

module.exports = router;
