const store = require('../../utils/birthday-service')

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - i)
const defaultBlessingText = '祝你生日快乐！'
const token = ''

Page({
  data: {
    record: null,
    activeTab: 'info',
    yearOptions,
    showAddGift: false,
    giftForm: { year: currentYear, yearIndex: 0, item: '', note: '' },
    showAddWish: false,
    wishForm: { item: '', note: '' },
    blessingText: defaultBlessingText
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
    const text = this.data.blessingText
    if (!text) {
      wx.showToast({ title: '暂无祝福语', icon: 'none' })
      return
    }
    wx.setClipboardData({
      data: text,
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

  getNewBlessing() {
    wx.showToast({
      title: '生成中',
      icon: 'loading',
      duration: 300000,
      mask: true
    })
    wx.request({
      url: 'https://api.minimaxi.com/v1/responses',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      data: {
        model: 'MiniMax-M3',
        input: `# 角色
        你是一名文案写手，擅长短文案。

        # 任务
        根据输入信息，写一条生日祝福语。

        # 输入
        - 生日日期：${this.data.record.birthdayText}
        - 名字：${this.data.record.name}
        - 关系：${this.data.record.relation}
        - 备注：${this.data.record.note}

        # 约束
        - 严格不超过 50 个汉字（标点不计入）
        - 必须自然融入全部输入信息
        - 简洁、有记忆点，不要凑字

        # 输出规则（重要）
        - 直接输出祝福语正文，仅此一行
        - 不要任何解释、前缀、推荐、备选方案
        - 不要"好的""以下是"等开场白
        - 不要表情符号（除非祝福语本身需要）
        - 如果输入内容为空，则忽略输入，正常输出

        # 示例
        输入：名字=小明，生日=1月1号，关系=同事，备注=程序员
        输出：程序员小明生日快乐，愿你的人生少写 if，多写 return。`
      },
      success: (res) => {
        const text = res.data && res.data.output_text
        wx.hideToast()
        if (!text) {
          wx.showToast({ title: '生成失败，请重试', icon: 'none', duration: 2000 })
          console.error('返回数据缺少 output_text：', res.data)
          return
        }
        this.setData({ blessingText: text })
        wx.showToast({ title: '生成成功', icon: 'success' })
      },
      fail: (err) => {
        wx.hideToast()
        wx.showToast({ title: '生成失败，请重试', icon: 'error', duration: 2000 })
        console.error('请求失败：', err)
      }
    })
  },
})
