const express = require('express');
const path = require('path');
const { join } = path;

var __filename = __filename;
var __dirname = path.dirname(__filename);

const router = express.Router();

router.route('/').get(async (req, res, next) => {
  res.sendFile(join(__dirname, '..', 'pages', 'login.html'));
});

router.route('/register').get(async (req, res, next) => {
  res.sendFile(join(__dirname, '..', 'pages', 'register.html'));
});

router.route('/verify-otp').get(async (req, res, next) => {
  res.sendFile(join(__dirname, '..', 'pages', 'verify-otp.html'));
});


router.route('/dashboard').get(async (req, res, next) => {
  res.sendFile(join(__dirname, '..', 'pages', 'dashboard.html'));
});

router.route('/userpage').get(async (req, res, next) => {
  res.sendFile(join(__dirname, '..', 'pages', 'userPage.html'));
});

router.route('/userpage/library').get(async (req, res, next) => {
  res.sendFile(join(__dirname, '..', 'pages', 'library.html'));
});

router.route('/userpage/settings').get(async (req, res, next) => {
  res.sendFile(join(__dirname, '..', 'pages', 'userSettings.html'));
});

router.route('/userpage/donateForm').get(async (req, res, next) => {
  res.sendFile(join(__dirname, '..', 'pages', 'donateForm.html'));
});

router.route('/userpage/account').get(async (req, res, next) => {
  res.sendFile(join(__dirname, '..', 'pages', 'userAccount.html'));
});

router.route('/clerkPage/*').get(async (req, res, next) => {
  res.sendFile(join(__dirname, '..', 'pages', 'clerkPage.html'));
});

router.route('/adminPage/*').get(async (req, res, next) => {
  res.sendFile(join(__dirname, '..', 'pages', 'adminPage.html'));
});

router.route('/borrowForm').get(async (req, res, next) => {
  res.sendFile(join(__dirname, '..', 'pages', 'borrowForm.html'));
});

module.exports = router;
