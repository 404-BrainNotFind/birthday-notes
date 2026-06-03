/**
 * 农历（阴历）转换工具
 * 支持 1900-2100 年范围的公历与农历互转
 */

// 农历数据表：每个年份用 4 字节编码
// 格式：0x[月信息][闰月][月天数bitmap高8位][月天数bitmap低8位]
// 月信息高4位：闰月月份（0=无闰月）
// 月天数bitmap：每个bit表示该月是大月(30天)还是小月(29天)，bit=1为大月
var LUNAR_INFO = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0,
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06aa0, 0x1a6c4, 0x0aae0,
  0x092e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
  0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
  0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
  0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a4d0, 0x0d150, 0x0f252,
  0x0d520
]

// 天干地支
var GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
var ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']
var ANIMALS = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪']
var LUNAR_MONTH_NAMES = ['正','二','三','四','五','六','七','八','九','十','冬','腊']
var LUNAR_DAY_NAMES = [
  '','初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
  '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
  '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'
]
var SOLAR_MONTH_DAYS = [31,28,31,30,31,30,31,31,30,31,30,31]

// ========== 基础工具 ==========

function isLeapSolarYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

function getSolarMonthDays(year, month) {
  if (month === 2) return isLeapSolarYear(year) ? 29 : 28
  return SOLAR_MONTH_DAYS[month - 1]
}

/**
 * 获取农历年信息
 * @returns {{ leapMonth: number, yearDays: number, monthDays: number[] }}
 *   leapMonth: 闰月月份（0=无闰月）
 *   yearDays: 该农历年的总天数
 *   monthDays: 每月天数数组 [0]不用, [1-12]为各月天数
 */
function getLunarYearInfo(lunarYear) {
  var info = LUNAR_INFO[lunarYear - 1900]
  var leapMonth = (info & 0xf)  // 低4位：闰月月份，0=无闰月
  var leapMonthDays = 0

  var monthDays = [0]
  var yearDays = 0

  // 处理普通月份（bit 4 开始是高12位表示大小月）
  // 从高到低依次代表正月到腊月（含闰月）
  var offset = 0x8000  // 从最高位开始

  for (var i = 1; i <= 12; i++) {
    var isBig = (info & offset) !== 0
    offset >>= 1
    var days = isBig ? 30 : 29
    monthDays.push(days)
    yearDays += days
  }

  if (leapMonth > 0) {
    var isBig = (info & offset) !== 0
    leapMonthDays = isBig ? 30 : 29
    // 插入闰月天数到 monthDays
    monthDays.splice(leapMonth + 1, 0, leapMonthDays)
    yearDays += leapMonthDays
  }

  return {
    leapMonth: leapMonth,
    yearDays: yearDays,
    monthDays: monthDays
  }
}

/**
 * 计算从 1900-01-31（农历1900年正月初一）到指定日期的天数偏移
 */
function solarDayOffset(year, month, day) {
  var offset = 0
  // 累加整年天数
  for (var y = 1900; y < year; y++) {
    offset += isLeapSolarYear(y) ? 366 : 365
  }
  // 累加当年已过月份天数
  for (var m = 1; m < month; m++) {
    offset += getSolarMonthDays(year, m)
  }
  offset += day - 1
  return offset
}

/**
 * 公历转农历
 * @returns {{ lunarYear, lunarMonth, lunarDay, isLeap }}
 */
function solarToLunar(year, month, day) {
  var offset = solarDayOffset(year, month, day)
  // 1900-01-31 是农历1900年正月初一，从那天算起
  var baseOffset = solarDayOffset(1900, 1, 31)
  var diff = offset - baseOffset

  if (diff < 0) {
    // 早于1900年，返回公历日期的简化表示
    return { lunarYear: year, lunarMonth: month, lunarDay: day, isLeap: false }
  }

  var lunarYear = 1900
  var lunarInfo
  while (true) {
    lunarInfo = getLunarYearInfo(lunarYear)
    if (diff < lunarInfo.yearDays) break
    diff -= lunarInfo.yearDays
    lunarYear++
  }

  var leapMonth = lunarInfo.leapMonth
  var monthDays = lunarInfo.monthDays
  var lunarMonth = 0
  var lunarDay = 0
  var isLeap = false

  for (var m = 1; m < monthDays.length; m++) {
    if (diff < monthDays[m]) {
      lunarMonth = m
      lunarDay = diff + 1
      // 判断是否闰月
      if (leapMonth > 0 && m > leapMonth + 1) {
        lunarMonth = m - 1
      }
      if (leapMonth > 0 && m === leapMonth + 1) {
        isLeap = true
        lunarMonth = leapMonth
      }
      break
    }
    diff -= monthDays[m]
  }

  return {
    lunarYear: lunarYear,
    lunarMonth: lunarMonth,
    lunarDay: lunarDay,
    isLeap: isLeap
  }
}

/**
 * 农历转公历（当年最近的）
 * @param lunarYear 农历年
 * @param lunarMonth 农历月
 * @param lunarDay 农历日
 * @param isLeap 是否闰月
 * @returns { year, month, day } | null
 */
function lunarToSolar(lunarYear, lunarMonth, lunarDay, isLeap) {
  if (lunarYear < 1900 || lunarYear > 2100) return null

  var lunarInfo = getLunarYearInfo(lunarYear)
  var monthDays = lunarInfo.monthDays
  var leapMonth = lunarInfo.leapMonth

  // 计算目标月在 monthDays 中的索引
  var targetMonthIndex = lunarMonth
  if (leapMonth > 0 && lunarMonth > leapMonth) {
    targetMonthIndex = lunarMonth + 1
  }
  if (isLeap && leapMonth === lunarMonth) {
    targetMonthIndex = lunarMonth + 1
  }

  if (lunarDay > monthDays[targetMonthIndex]) return null

  // 计算从农历正月初一到目标日期的天数
  var lunarDayOffset = 0
  for (var m = 1; m < targetMonthIndex; m++) {
    lunarDayOffset += monthDays[m]
  }
  lunarDayOffset += (lunarDay - 1)

  // 计算农历正月初一的公历日期
  // 先算到指定农历年的总偏移
  var baseOffset = solarDayOffset(1900, 1, 31)
  var yearOffset = 0
  for (var y = 1900; y < lunarYear; y++) {
    yearOffset += getLunarYearInfo(y).yearDays
  }
  var totalOffset = baseOffset + yearOffset + lunarDayOffset

  // 偏移反推公历日期
  var solarYear = 1900
  while (true) {
    var solarYearDays = isLeapSolarYear(solarYear) ? 366 : 365
    var startOffset = solarDayOffset(solarYear, 1, 1)
    if (totalOffset < startOffset + solarYearDays) break
    solarYear++
  }

  var remain = totalOffset - solarDayOffset(solarYear, 1, 1)
  var solarMonth = 1
  while (solarMonth <= 12) {
    var monthDaysCount = getSolarMonthDays(solarYear, solarMonth)
    if (remain < monthDaysCount) break
    remain -= monthDaysCount
    solarMonth++
  }

  return {
    year: solarYear,
    month: solarMonth,
    day: remain + 1
  }
}

// ========== 公开 API ==========

/**
 * 格式化农历月日
 * @returns {string} 如 "五月二十"
 */
function formatLunarMonthDay(month, day) {
  var monthName = LUNAR_MONTH_NAMES[month - 1] || String(month)
  var dayName = LUNAR_DAY_NAMES[day] || String(day)
  return '农历' + monthName + '月' + dayName
}

/**
 * 格式化农历完整日期
 */
function formatLunarFullDate(lunarYear, lunarMonth, lunarDay, isLeap) {
  var prefix = isLeap ? '闰' : ''
  var monthName = LUNAR_MONTH_NAMES[lunarMonth - 1] || String(lunarMonth)
  var dayName = LUNAR_DAY_NAMES[lunarDay] || String(lunarDay)
  var gan = GAN[(lunarYear - 4) % 10]
  var zhi = ZHI[(lunarYear - 4) % 12]
  var animal = ANIMALS[(lunarYear - 4) % 12]
  return gan + zhi + '年（' + animal + '）' + prefix + monthName + '月' + dayName
}

/**
 * 获取农历生日的下一个公历日期
 * @param lunarMonth 农历月
 * @param lunarDay 农历日
 * @param isLeap 是否闰月生日
 * @param today 今天日期
 * @returns {Date|null} 下一次生日对应的公历日期
 */
function getNextLunarDate(lunarMonth, lunarDay, isLeap, today) {
  if (!today) today = new Date()
  var currentYear = today.getFullYear()

  // 往前看3年，避免闰月计算导致的遗漏
  for (var yearOffset = -1; yearOffset <= 2; yearOffset++) {
    var checkYear = currentYear + yearOffset
    var solar = lunarToSolar(checkYear, lunarMonth, lunarDay, isLeap)
    if (!solar) {
      // 尝试非闰月
      if (isLeap) {
        solar = lunarToSolar(checkYear, lunarMonth, lunarDay, false)
      }
      if (!solar) continue
    }
    var date = new Date(solar.year, solar.month - 1, solar.day)
    date.setHours(0, 0, 0, 0)
    var normalizedToday = new Date(today)
    normalizedToday.setHours(0, 0, 0, 0)
    if (date >= normalizedToday) {
      return date
    }
  }

  // 兜底：再往后找几年
  for (var y = currentYear + 2; y <= currentYear + 5; y++) {
    var s = lunarToSolar(y, lunarMonth, lunarDay, isLeap)
    if (!s && isLeap) {
      s = lunarToSolar(y, lunarMonth, lunarDay, false)
    }
    if (s) {
      return new Date(s.year, s.month - 1, s.day)
    }
  }

  return null
}

/**
 * 获取指定公历日期对应的农历信息
 */
function getLunarBySolar(year, month, day) {
  return solarToLunar(year, month, day)
}

module.exports = {
  formatLunarMonthDay: formatLunarMonthDay,
  formatLunarFullDate: formatLunarFullDate,
  getNextLunarDate: getNextLunarDate,
  getLunarBySolar: getLunarBySolar,
  solarToLunar: solarToLunar,
  lunarToSolar: lunarToSolar
}
