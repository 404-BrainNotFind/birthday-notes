const store = require('../../utils/birthday-service')
const dateUtil = require('../../utils/date')

function getToken() {
  return wx.getStorageSync('invite_token') || ''
}

Page({
  data: {
    items: [],
    loading: true,
  },

  onShow() {
    this.loadItems()
  },

  loadItems() {
    this.setData({ loading: true })
    if (!wx.cloud) {
      this.setData({ loading: false })
      wx.showToast({ title: '请先开通云开发', icon: 'none' })
      return
    }
    wx.cloud.callFunction({
      name: 'getInboxItems',
      data: { token: getToken() },
      success: (res) => {
        const items = Array.isArray(res.result) ? res.result : []
        this.setData({ items, loading: false })
      },
      fail: () => {
        this.setData({ loading: false })
        wx.showToast({ title: '加载失败', icon: 'none' })
      },
    })
  },

  importItem(e) {
    const { id, name, month, day, contact, note } = e.currentTarget.dataset
    wx.showModal({
      title: `导入 ${name} 的生日`,
      content: `生日：${month}月${day}日\n将添加到你的生日簿`,
      confirmText: '导入',
      success: (res) => {
        if (!res.confirm) return
        const record = {
          id: `imported_${Date.now()}`,
          name,
          relation: '朋友',
          month,
          day,
          remindDays: 7,
          contact: contact || '',
          note: note || '',
          createTime: dateUtil.formatCreateTime(new Date()),
          giftHistory: [],
          wishlist: [],
        }
        store.addBirthday(record)
        this.markImported(id)
        wx.showToast({ title: '已导入', icon: 'success' })
      },
    })
  },

  ignoreItem(e) {
    const { id, name } = e.currentTarget.dataset
    wx.showModal({
      title: `忽略 ${name} 的提交`,
      content: '忽略后将从收件箱移除',
      confirmText: '忽略',
      confirmColor: '#8e6f63',
      success: (res) => {
        if (res.confirm) this.markImported(id)
      },
    })
  },

  markImported(id) {
    wx.cloud.callFunction({
      name: 'markImported',
      data: { id },
      success: () => this.loadItems(),
      fail: () => this.loadItems(),
    })
  },
})
