/**
 * 农历转换工具 - 标准实现
 * 数据格式: bit0-3=闰月, bit4-15=月份大小(bit15=正月→bit4=腊月, 1=30天)
 */

var LUNAR_INFO = [
  0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
  0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
  0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
  0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
  0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
  0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0,
  0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
  0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6,
  0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
  0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x05ac0,0x0ab60,0x096d5,0x092e0,
  0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
  0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
  0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
  0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
  0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0,
  0x14b63,0x09370,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50,0x06aa0,0x1a6c4,0x0aae0,
  0x092e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4,
  0x052d0,0x0a9b8,0x0a950,0x0b4a0,0x0b6a6,0x0ad50,0x055a0,0x0aba4,0x0a5b0,0x052b0,
  0x0b273,0x06930,0x07337,0x06aa0,0x0ad50,0x14b55,0x04b60,0x0a570,0x054e4,0x0d160,
  0x0e968,0x0d520,0x0daa0,0x16aa6,0x056d0,0x04ae0,0x0a9d4,0x0a4d0,0x0d150,0x0f252,
  0x0d520
];

var GAN  = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
var ZHI  = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
var ANI  = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
var LM   = ['正','二','三','四','五','六','七','八','九','十','冬','腊'];
var LD   = ['','初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
            '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
            '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];

// 该农历年的闰月月份 (0=无)
function leapMonth(y) { return LUNAR_INFO[y - 1900] & 0xf; }
// 闰月天数
function leapDays(y) { return leapMonth(y) ? ((LUNAR_INFO[y - 1900] & 0x10000) ? 30 : 29) : 0; }
// 农历月天数 (m: 1-12)
function monthDays(y, m) { return (LUNAR_INFO[y - 1900] & (0x10000 >> m)) ? 30 : 29; }
// 农历年总天数
function yearDays(y) {
  var sum = 348;  // 12 * 29
  for (var i = 0x8000; i > 0x8; i >>= 1) sum += (LUNAR_INFO[y - 1900] & i) ? 1 : 0;
  return sum + leapDays(y);
}

// 公历 → 农历 (使用 UTC 避免时区干扰)
function solarToLunar(y, m, d) {
  var offset = Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(1900, 0, 31)) / 86400000);
  if (offset < 0) return null;

  var ly, i, temp = 0;
  for (ly = 1900; ly < 2101 && offset > 0; ly++) {
    temp = yearDays(ly);
    if (offset < temp) break;
    offset -= temp;
  }

  var lm = leapMonth(ly);
  var isLeap = false;
  for (i = 1; i < 13 && offset > 0; i++) {
    if (lm > 0 && i === (lm + 1) && !isLeap) {
      --i; isLeap = true; temp = leapDays(ly);
    } else {
      temp = monthDays(ly, i);
    }
    if (isLeap && i === (lm + 1)) isLeap = false;
    if (offset < temp) break;
    offset -= temp;
  }

  if (i === 13) { offset -= temp; i--; }

  var resultMonth = i;
  var resultIsLeap = isLeap;
  if (lm > 0 && !isLeap && i > lm) resultMonth--;

  return {
    lunarYear: ly,
    lunarMonth: resultMonth,
    lunarDay: offset + 1,
    isLeap: resultIsLeap
  };
}

// 农历 → 公历
function lunarToSolar(ly, lm, ld, isLeap) {
  if (ly < 1900 || ly > 2100) return null;
  var offset = 0;
  for (var y = 1900; y < ly; y++) offset += yearDays(y);

  var leap = leapMonth(ly);
  for (var i = 1; i < lm; i++) offset += monthDays(ly, i);
  if (leap > 0 && lm > leap) offset += leapDays(ly);

  offset += (ld - 1);

  var base = Date.UTC(1900, 0, 31);
  var ms = base + offset * 86400000;
  var dt = new Date(ms);
  return { year: dt.getUTCFullYear(), month: dt.getUTCMonth() + 1, day: dt.getUTCDate() };
}

// 格式化
function formatLunarMonthDay(month, day) {
  return '农历' + (LM[month - 1] || month) + '月' + (LD[day] || day);
}

function formatLunarFullDate(ly, lm, ld, isLeap) {
  var p = isLeap ? '闰' : '';
  return GAN[(ly - 4) % 10] + ZHI[(ly - 4) % 12] + '年（' + ANI[(ly - 4) % 12] + '）' + p + LM[lm - 1] + '月' + LD[ld];
}

function getNextLunarDate(lm, ld, isLeap, today) {
  if (!today) today = new Date();
  var ty = today.getUTCFullYear ? today.getUTCFullYear() : today.getFullYear();
  var tm = (today.getUTCMonth ? today.getUTCMonth() : today.getMonth()) + 1;
  var td = today.getUTCDate ? today.getUTCDate() : today.getDate();

  for (var y = ty - 1; y <= ty + 5; y++) {
    var s = lunarToSolar(y, lm, ld, isLeap);
    if (!s) continue;
    if (s.year > ty) return new Date(s.year, s.month - 1, s.day);
    if (s.year === ty && s.month > tm) return new Date(s.year, s.month - 1, s.day);
    if (s.year === ty && s.month === tm && s.day >= td) return new Date(s.year, s.month - 1, s.day);
  }
  return null;
}

function getLunarBySolar(y, m, d) { return solarToLunar(y, m, d); }

module.exports = {
  formatLunarMonthDay: formatLunarMonthDay,
  formatLunarFullDate: formatLunarFullDate,
  getNextLunarDate: getNextLunarDate,
  getLunarBySolar: getLunarBySolar,
  solarToLunar: solarToLunar,
  lunarToSolar: lunarToSolar
};