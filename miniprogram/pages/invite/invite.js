const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1)

function buildDayOptions(month) {
  const total = new Date(2024, month, 0).getDate()
  return Array.from({ length: total }, (_, i) => i + 1)
}

Page({
  data: {
    inviterToken: '',
    monthOptions,
    dayOptions: buildDayOptions(1),
    form: { name: '', month: 1, day: 1, contact: '', note: '' },
    monthIndex: 0,
    dayIndex: 0,
    submitted: false,
    submitting: false,
  },

  onLoad(options) {
    // 来自分享卡：?token=xxx，来自二维码扫描：scene=xxx
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

  onMonthChange(e) {
    const monthIndex = Number(e.detail.value)
    const month = monthOptions[monthIndex]
    const dayOptions = buildDayOptions(month)
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
    const { name, month, day, contact, note } = this.data.form
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
