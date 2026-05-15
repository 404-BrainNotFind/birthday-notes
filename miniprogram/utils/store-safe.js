const rawStore = require('./store')
const dateUtil = require('./date')
const { seedBirthdays } = require('../data/mock')

const BIRTHDAY_KEY = 'birthday_records'

function ensureSeedData() {
  if (typeof rawStore.ensureSeedData === 'function') {
    rawStore.ensureSeedData()
    return
  }

  const records = wx.getStorageSync(BIRTHDAY_KEY)
  if (!records || !records.length) {
    wx.setStorageSync(BIRTHDAY_KEY, seedBirthdays)
  }
}

function getRawList() {
  ensureSeedData()
  return wx.getStorageSync(BIRTHDAY_KEY) || []
}

function getBirthdays() {
  if (typeof rawStore.getBirthdays === 'function') {
    return rawStore.getBirthdays()
  }

  return dateUtil.sortByUpcoming(getRawList().map((item) => dateUtil.enrichBirthday(item)))
}

function getBirthdayById(id) {
  if (typeof rawStore.getBirthdayById === 'function') {
    return rawStore.getBirthdayById(id)
  }

  return getBirthdays().find((item) => item.id === id)
}

function addBirthday(record) {
  if (typeof rawStore.addBirthday === 'function') {
    rawStore.addBirthday(record)
    return
  }

  const list = getRawList()
  list.unshift(record)
  wx.setStorageSync(BIRTHDAY_KEY, list)
}

function updateBirthday(record) {
  if (typeof rawStore.updateBirthday === 'function') {
    rawStore.updateBirthday(record)
    return
  }

  const list = getRawList().map((item) => {
    if (item.id === record.id) {
      return record
    }
    return item
  })
  wx.setStorageSync(BIRTHDAY_KEY, list)
}

function deleteBirthday(id) {
  if (typeof rawStore.deleteBirthday === 'function') {
    rawStore.deleteBirthday(id)
    return
  }

  const list = getRawList().filter((item) => item.id !== id)
  wx.setStorageSync(BIRTHDAY_KEY, list)
}

module.exports = {
  addBirthday,
  deleteBirthday,
  ensureSeedData,
  getBirthdayById,
  getBirthdays,
  updateBirthday
}
