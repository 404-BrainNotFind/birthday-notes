const { seedBirthdays } = require('../data/mock')
const dateUtil = require('./date')

const BIRTHDAY_KEY = 'birthday_records'

function normalizeRecord(item) {
  const next = {
    id: item.id,
    name: item.name,
    relation: item.relation,
    month: item.month,
    day: item.day,
    remindDays: item.remindDays,
    contact: item.contact || '',
    note: item.note || '',
    createTime: item.createTime,
    giftHistory: Array.isArray(item.giftHistory) ? item.giftHistory : [],
    wishlist: Array.isArray(item.wishlist) ? item.wishlist : [],
  }

  if (item.id === 'b004' && item.calendarType === 'lunar') {
    next.name = '飞舞'
    next.relation = '朋友'
    next.month = 5
    next.day = 20
    next.remindDays = 5
    next.note = '还没有填写备注。'
  }

  return next
}

function ensureSeedData() {
  const records = wx.getStorageSync(BIRTHDAY_KEY)
  if (!Array.isArray(records) || records.length === 0) {
    wx.setStorageSync(BIRTHDAY_KEY, seedBirthdays)
  }
}

function getRawBirthdays() {
  ensureSeedData()
  const records = wx.getStorageSync(BIRTHDAY_KEY)
  const list = Array.isArray(records) ? records : []
  const normalized = list.map(normalizeRecord)

  if (JSON.stringify(list) !== JSON.stringify(normalized)) {
    wx.setStorageSync(BIRTHDAY_KEY, normalized)
  }

  return normalized
}

function getBirthdays() {
  return dateUtil.sortByUpcoming(
    getRawBirthdays().map((item) => dateUtil.enrichBirthday(item))
  )
}

function getBirthdayById(id) {
  return getBirthdays().find((item) => item.id === id) || null
}

function addBirthday(record) {
  const list = getRawBirthdays()
  list.unshift(record)
  wx.setStorageSync(BIRTHDAY_KEY, list)
}

function updateBirthday(record) {
  const list = getRawBirthdays().map((item) => {
    if (item.id !== record.id) return item
    // Spread existing item first to preserve giftHistory/wishlist,
    // then override only the fields the edit form manages.
    return {
      ...item,
      name: record.name,
      relation: record.relation,
      month: record.month,
      day: record.day,
      remindDays: record.remindDays,
      contact: record.contact,
      note: record.note,
      createTime: record.createTime,
    }
  })
  wx.setStorageSync(BIRTHDAY_KEY, list)
}

function deleteBirthday(id) {
  const list = getRawBirthdays().filter((item) => item.id !== id)
  wx.setStorageSync(BIRTHDAY_KEY, list)
}

function addGift(id, gift) {
  const list = getRawBirthdays().map((item) => {
    if (item.id !== id) return item
    return { ...item, giftHistory: [gift, ...(item.giftHistory || [])] }
  })
  wx.setStorageSync(BIRTHDAY_KEY, list)
}

function deleteGift(id, index) {
  const list = getRawBirthdays().map((item) => {
    if (item.id !== id) return item
    const giftHistory = [...(item.giftHistory || [])]
    giftHistory.splice(index, 1)
    return { ...item, giftHistory }
  })
  wx.setStorageSync(BIRTHDAY_KEY, list)
}

function addWish(id, wish) {
  const list = getRawBirthdays().map((item) => {
    if (item.id !== id) return item
    return { ...item, wishlist: [...(item.wishlist || []), wish] }
  })
  wx.setStorageSync(BIRTHDAY_KEY, list)
}

function deleteWish(id, index) {
  const list = getRawBirthdays().map((item) => {
    if (item.id !== id) return item
    const wishlist = [...(item.wishlist || [])]
    wishlist.splice(index, 1)
    return { ...item, wishlist }
  })
  wx.setStorageSync(BIRTHDAY_KEY, list)
}

module.exports = {
  addBirthday,
  deleteBirthday,
  ensureSeedData,
  getBirthdayById,
  getBirthdays,
  getRawBirthdays,
  updateBirthday,
  addGift,
  deleteGift,
  addWish,
  deleteWish,
}
