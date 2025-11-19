const express = require("express");
const router = express.Router();

const {
  addBankAccount,
  getBankAccounts,
  deleteBankAccount,
} = require("../controllers/bankAccountController");

router.post("/bankAccounts", addBankAccount);
router.get("/bankAccounts", getBankAccounts);
router.delete("/bankAccounts/:id", deleteBankAccount);

module.exports = router;
