const calendarOptions = ['公历生日', '农历生日']
const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1)

function buildDayOptions(month, calendarType) {
  calendarType = calendarType || 'solar'
  if (calendarType === 'lunar') {
    return Array.from({ length: 30 }, (_, i) => i + 1)
  }
  const total = new Date(2024, month, 0).getDate()
  return Array.from({ length: total }, (_, i) => i + 1)
}

Page({
  data: {
    inviterToken: '',
    calendarOptions,
    monthOptions,
    dayOptions: buildDayOptions(1),
    form: { name: '', calendarType: 'solar', month: 1, day: 1, contact: '', note: '' },
    calendarIndex: 0,
    monthIndex: 0,
    dayIndex: 0,
    submitted: false,
    submitting: false,
  },

  onLoad(options) {
    const token = options.token || decodeURIComponent(options.scene || '')
    this.setData({ inviterToken: token })
  },

  onNameInput(e) {
    this.setData({ 'form.name': e.detail.value })
  },

  onContactInput(e) {
    this.setData({ 'form.contact': e.detail.value })
  },

  onNoteInput(e) {
    this.setData({ 'form.note': e.detail.value })
  },

  onCalendarChange(e) {
    const calendarIndex = Number(e.detail.value)
    const calendarType = calendarIndex === 1 ? 'lunar' : 'solar'
    const dayOptions = buildDayOptions(this.data.form.month, calendarType)
    let day = this.data.form.day
    if (!dayOptions.includes(day)) day = dayOptions[dayOptions.length - 1]
    this.setData({
      calendarIndex,
      dayOptions,
      dayIndex: dayOptions.indexOf(day),
      'form.calendarType': calendarType,
      'form.day': day,
    })
  },

  onMonthChange(e) {
    const monthIndex = Number(e.detail.value)
    const month = monthOptions[monthIndex]
    const dayOptions = buildDayOptions(month, this.data.form.calendarType)
    let day = this.data.form.day
    if (!dayOptions.includes(day)) day = 1
    this.setData({
      monthIndex,
      dayOptions,
      dayIndex: dayOptions.indexOf(day) >= 0 ? dayOptions.indexOf(day) : 0,
      'form.month': month,
      'form.day': day,
    })
  },

  onDayChange(e) {
    const dayIndex = Number(e.detail.value)
    this.setData({ dayIndex, 'form.day': this.data.dayOptions[dayIndex] })
  },

  submit() {
    const { name, calendarType, month, day, contact, note } = this.data.form
    if (!name.trim()) {
      wx.showToast({ title: '请填写你的名字', icon: 'none' })
      return
    }
    if (!this.data.inviterToken) {
      wx.showToast({ title: '邀请链接无效', icon: 'none' })
      return
    }
    this.setData({ submitting: true })
    wx.cloud.callFunction({
      name: 'submitInvitation',
      data: {
        inviterToken: this.data.inviterToken,
        name: name.trim(),
        calendarType: calendarType || 'solar',
        month,
        day,
        contact: contact.trim(),
        note: note.trim(),
      },
      success: () => {
        this.setData({ submitted: true, submitting: false })
      },
      fail: () => {
        this.setData({ submitting: false })
        wx.showToast({ title: '提交失败，请重试', icon: 'none' })
      },
    })
  },
})
