const { seedBirthdays } = require('../data/mock')
const dateUtil = require('./date')

const BIRTHDAY_KEY = 'birthday_records'

function ensureSeedData() {
  const records = wx.getStorageSync(BIRTHDAY_KEY)
  if (!records || !records.length) {
    wx.setStorageSync(BIRTHDAY_KEY, seedBirthdays)
  }
}

function getBirthdays() {
  ensureSeedData()
  const list = wx.getStorageSync(BIRTHDAY_KEY) || []
  return dateUtil.sortByUpcoming(list.map((item) => dateUtil.enrichBirthday(item)))
}

function getBirthdayById(id) {
  return getBirthdays().find((item) => item.id === id)
}

function saveBirthdays(list) {
  wx.setStorageSync(BIRTHDAY_KEY, list)
}

function addBirthday(record) {
  const list = wx.getStorageSync(BIRTHDAY_KEY) || []
  list.unshift(record)
  saveBirthdays(list)
}

function updateBirthday(record) {
  const list = (wx.getStorageSync(BIRTHDAY_KEY) || []).map((item) => {
    if (item.id === record.id) {
      return record
    }
    return item
  })
  saveBirthdays(list)
}

function deleteBirthday(id) {
  const list = (wx.getStorageSync(BIRTHDAY_KEY) || []).filter((item) => item.id !== id)
  saveBirthdays(list)
}

exports.addBirthday = addBirthday
exports.deleteBirthday = deleteBirthday
exports.ensureSeedData = ensureSeedData
exports.getBirthdayById = getBirthdayById
exports.getBirthdays = getBirthdays
exports.saveBirthdays = saveBirthdays
exports.updateBirthday = updateBirthday
