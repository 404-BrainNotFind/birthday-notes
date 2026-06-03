const lunar = require('./lunar')

function pad(value) {
  return String(value).padStart(2, '0')
}

function formatMonthDay(month, day) {
  return `${month}月${day}日`
}

function formatDateText(date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

function createBlessing(name) {
  return `${name}，生日快乐！祝你新的一岁开心顺利，万事如意！`
}

function getNextSolarBirthday(month, day, today) {
  today = today || new Date()
  const currentYear = today.getFullYear()
  let nextDate = new Date(currentYear, month - 1, day)
  nextDate.setHours(0, 0, 0, 0)

  const normalizedToday = new Date(today)
  normalizedToday.setHours(0, 0, 0, 0)

  if (nextDate < normalizedToday) {
    nextDate = new Date(currentYear + 1, month - 1, day)
    nextDate.setHours(0, 0, 0, 0)
  }

  return nextDate
}

function getDaysUntilSolarBirthday(month, day, today) {
  const nextDate = getNextSolarBirthday(month, day, today)
  const normalizedToday = new Date(today || new Date())
  normalizedToday.setHours(0, 0, 0, 0)
  const diff = nextDate.getTime() - normalizedToday.getTime()
  return Math.round(diff / (24 * 60 * 60 * 1000))
}

function getDaysUntilDate(nextDate, today) {
  const normalizedToday = new Date(today || new Date())
  normalizedToday.setHours(0, 0, 0, 0)
  const diff = nextDate.getTime() - normalizedToday.getTime()
  return Math.round(diff / (24 * 60 * 60 * 1000))
}

function enrichBirthday(item, today) {
  today = today || new Date()
  const calendarType = item.calendarType || 'solar'
  const isLunar = calendarType === 'lunar'
  const birthdayText = isLunar
    ? lunar.formatLunarMonthDay(item.month, item.day)
    : `公历 ${formatMonthDay(item.month, item.day)}`
  const blessingText = createBlessing(item.name)
  const nextDate = isLunar
    ? lunar.getNextLunarDate(item.month, item.day, false, today)
    : getNextSolarBirthday(item.month, item.day, today)
  const daysUntil = nextDate ? getDaysUntilDate(nextDate, today) : 9999

  let statusText = '已记录'
  if (daysUntil === 0) {
    statusText = '今天生日'
  } else if (daysUntil <= item.remindDays) {
    statusText = `还有 ${daysUntil} 天`
  } else {
    statusText = `距下次生日 ${daysUntil} 天`
  }

  return {
    ...item,
    calendarType,
    birthdayText,
    blessingText,
    daysUntil,
    isToday: daysUntil === 0,
    isUpcoming: daysUntil > 0 && daysUntil <= item.remindDays,
    nextDateText: nextDate ? formatDateText(nextDate) : '暂不支持该年份',
    statusText
  }
}

function sortByUpcoming(list) {
  return list.slice().sort((a, b) => {
    const aValue = typeof a.daysUntil === 'number' ? a.daysUntil : 9999
    const bValue = typeof b.daysUntil === 'number' ? b.daysUntil : 9999
    return aValue - bValue
  })
}

function getStats(list) {
  const validList = list.filter((item) => typeof item.daysUntil === 'number')
  const todayCount = validList.filter((item) => item.daysUntil === 0).length
  const within7Count = validList.filter((item) => item.daysUntil >= 0 && item.daysUntil <= 7).length
  const thisMonth = new Date().getMonth() + 1
  // 使用 nextDateText 匹配本月生日，兼容农历
  const monthCount = list.filter((item) => {
    if (typeof item.daysUntil !== 'number' || !item.nextDateText) {
      // 降级：用原始 month 字段
      return item.month === thisMonth
    }
    return item.nextDateText.includes(`年${thisMonth}月`)
  }).length

  return {
    totalCount: list.length,
    todayCount,
    within7Count,
    monthCount
  }
}

function formatCreateTime(date) {
  date = date || new Date()
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

module.exports = {
  createBlessing,
  enrichBirthday,
  formatCreateTime,
  formatDateText,
  formatMonthDay,
  getStats,
  sortByUpcoming
}
