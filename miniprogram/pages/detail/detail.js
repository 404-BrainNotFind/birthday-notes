const store = require('../../utils/birthday-service')

Page({
  data: {
    record: null
  },

  onLoad(options) {
    this.recordId = options.id
  },

  onShow() {
    this.loadDetail()
  },

  loadDetail() {
    const record = store.getBirthdayById(this.recordId)
    if (!record) {
      wx.showToast({
        title: '记录不存在',
        icon: 'none'
      })
      return
    }

    this.setData({ record })
  },

  editRecord() {
    wx.setStorageSync('birthday_edit_target', this.recordId)
    wx.switchTab({
      url: '/pages/add/add'
    })
  },

  deleteRecord() {
    wx.showModal({
      title: '确认删除',
      content: `确定要删除 ${this.data.record.name} 的生日记录吗？`,
      confirmText: '删除',
      confirmColor: '#d95f4e',
      success: (res) => {
        if (res.confirm) {
          store.deleteBirthday(this.recordId)
          wx.showToast({ title: '已删除', icon: 'success' })
          setTimeout(() => wx.navigateBack(), 500)
        }
      }
    })
  },

  copyBlessing() {
    wx.setClipboardData({
      data: this.data.record.blessingText,
      success() {
        wx.showToast({ title: '已复制', icon: 'success' })
      }
    })
  }
})
