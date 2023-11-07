const router = require("express").Router();

const { addOneAi, getOneQuery } = require("../controllers/aiController");

router.post("/upload", addOneAi);
router.post("/create", getOneQuery);

module.exports = router;
