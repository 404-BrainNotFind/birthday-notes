const store = require('../../utils/birthday-service')

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - i)

Page({
  data: {
    record: null,
    activeTab: 'info',
    yearOptions,
    showAddGift: false,
    giftForm: { year: currentYear, yearIndex: 0, item: '', note: '' },
    showAddWish: false,
    wishForm: { item: '', note: '' },
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
      wx.showToast({ title: '记录不存在', icon: 'none' })
      return
    }
    this.setData({ record })
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab, showAddGift: false, showAddWish: false })
  },

  editRecord() {
    wx.setStorageSync('birthday_edit_target', this.recordId)
    wx.switchTab({ url: '/pages/add/add' })
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
      success() { wx.showToast({ title: '已复制', icon: 'success' }) }
    })
  },

  // ── 礼物记录 ──────────────────────────────────────

  toggleAddGift() {
    this.setData({ showAddGift: !this.data.showAddGift, showAddWish: false })
  },

  onGiftYearChange(e) {
    const yearIndex = Number(e.detail.value)
    this.setData({
      'giftForm.yearIndex': yearIndex,
      'giftForm.year': yearOptions[yearIndex],
    })
  },

  onGiftItemInput(e) {
    this.setData({ 'giftForm.item': e.detail.value })
  },

  onGiftNoteInput(e) {
    this.setData({ 'giftForm.note': e.detail.value })
  },

  submitAddGift() {
    const { year, item, note } = this.data.giftForm
    if (!item.trim()) {
      wx.showToast({ title: '请填写礼物名称', icon: 'none' })
      return
    }
    store.addGift(this.recordId, { year, item: item.trim(), note: note.trim() })
    this.setData({
      showAddGift: false,
      giftForm: { year: currentYear, yearIndex: 0, item: '', note: '' },
    })
    this.loadDetail()
  },

  deleteGift(e) {
    const index = e.currentTarget.dataset.index
    wx.showModal({
      title: '删除礼物记录',
      content: '确定删除这条记录吗？',
      confirmText: '删除',
      confirmColor: '#d95f4e',
      success: (res) => {
        if (res.confirm) {
          store.deleteGift(this.recordId, index)
          this.loadDetail()
        }
      }
    })
  },

  // ── 心愿单 ────────────────────────────────────────

  toggleAddWish() {
    this.setData({ showAddWish: !this.data.showAddWish, showAddGift: false })
  },

  onWishItemInput(e) {
    this.setData({ 'wishForm.item': e.detail.value })
  },

  onWishNoteInput(e) {
    this.setData({ 'wishForm.note': e.detail.value })
  },

  submitAddWish() {
    const { item, note } = this.data.wishForm
    if (!item.trim()) {
      wx.showToast({ title: '请填写心愿内容', icon: 'none' })
      return
    }
    store.addWish(this.recordId, { item: item.trim(), note: note.trim() })
    this.setData({ showAddWish: false, wishForm: { item: '', note: '' } })
    this.loadDetail()
  },

  deleteWish(e) {
    const index = e.currentTarget.dataset.index
    wx.showModal({
      title: '删除心愿',
      content: '确定删除这个心愿吗？',
      confirmText: '删除',
      confirmColor: '#d95f4e',
      success: (res) => {
        if (res.confirm) {
          store.deleteWish(this.recordId, index)
          this.loadDetail()
        }
      }
    })
  },
})
