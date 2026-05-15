function pad(value) {
  return String(value).padStart(2, '0')
}

function formatMonthDay(month, day) {
  return `${month}月${day}日`
}

function createBlessing(name) {
  return `${name}，生日快乐！祝你新的一岁开心顺利，万事如意！`
}

function getNextSolarBirthday(month, day, today = new Date()) {
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

function getDaysUntilSolarBirthday(month, day, today = new Date()) {
  const nextDate = getNextSolarBirthday(month, day, today)
  const normalizedToday = new Date(today)
  normalizedToday.setHours(0, 0, 0, 0)
  const diff = nextDate.getTime() - normalizedToday.getTime()
  return Math.round(diff / (24 * 60 * 60 * 1000))
}

function enrichBirthday(item, today = new Date()) {
  const birthdayText = formatMonthDay(item.month, item.day)
  const blessingText = createBlessing(item.name)
  const daysUntil = getDaysUntilSolarBirthday(item.month, item.day, today)

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
    birthdayText,
    blessingText,
    daysUntil,
    isToday: daysUntil === 0,
    isUpcoming: daysUntil > 0 && daysUntil <= item.remindDays,
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
  const solarList = list.filter((item) => typeof item.daysUntil === 'number')
  const todayCount = solarList.filter((item) => item.daysUntil === 0).length
  const within7Count = solarList.filter((item) => item.daysUntil >= 0 && item.daysUntil <= 7).length
  const thisMonth = new Date().getMonth() + 1
  const monthCount = list.filter((item) => item.month === thisMonth).length

  return {
    totalCount: list.length,
    todayCount,
    within7Count,
    monthCount
  }
}

function formatCreateTime(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

module.exports = {
  createBlessing,
  enrichBirthday,
  formatCreateTime,
  formatMonthDay,
  getStats,
  sortByUpcoming
}
