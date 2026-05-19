const dateUtil = require('../../utils/date')

const EDIT_TARGET_KEY = 'birthday_edit_target'
const relationOptions = ['朋友', '同学', '家人', '同事', '其他']
const remindOptions = [1, 3, 5, 7, 10, 15, 30]
const monthOptions = Array.from({ length: 12 }, (_, index) => index + 1)

function buildDayOptions(month) {
  const totalDays = new Date(2024, month, 0).getDate()
  return Array.from({ length: totalDays }, (_, index) => index + 1)
}

function createEmptyForm() {
  return {
    id: '',
    name: '',
    relation: relationOptions[0],
    month: 1,
    day: 1,
    remindDays: 3,
    contact: '',
    note: '',
    createTime: ''
  }
}

function getStore() {
  return require('../../utils/birthday-service')
}

Page({
  data: {
    form: createEmptyForm(),
    relationOptions,
    remindOptions,
    monthOptions,
    dayOptions: buildDayOptions(1),
    relationIndex: 0,
    monthIndex: 0,
    dayIndex: 0,
    remindIndex: 1,
    pageTitle: '添加生日'
  },

  onLoad(options) {
    if (options.id) {
      this.fillFormById(options.id)
    }
  },

  onShow() {
    const editId = wx.getStorageSync(EDIT_TARGET_KEY)
    if (editId) {
      wx.removeStorageSync(EDIT_TARGET_KEY)
      this.fillFormById(editId)
      // switchTab from a non-tab page (detail) can fire onShow more than
      // once during the transition. Guard so the immediate repeat keeps
      // the edit form instead of falling through to resetForm().
      this._keepEditForm = true
      return
    }

    if (this._keepEditForm) {
      // Spurious second onShow right after an edit-fill — keep the form,
      // consume the guard so a later real visit can still reset.
      this._keepEditForm = false
      return
    }

    if (this.data.form.id) {
      this.resetForm()
    }
  },

  onHide() {
    // Leaving the add tab ends the edit-entry transition; a later return
    // to the 添加 tab should start a fresh add form.
    this._keepEditForm = false
  },

  fillFormById(id) {
    const store = getStore()
    const record = store.getBirthdayById(id)
    if (!record) {
      return
    }

    const monthIndex = monthOptions.indexOf(record.month)
    const dayOptions = buildDayOptions(record.month)
    const dayIndex = dayOptions.indexOf(record.day)
    const relationIndex = relationOptions.indexOf(record.relation)
    const remindIndex = remindOptions.indexOf(record.remindDays)

    this.setData({
      form: {
        id: record.id,
        name: record.name,
        relation: record.relation,
        month: record.month,
        day: record.day,
        remindDays: record.remindDays,
        contact: record.contact,
        note: record.note,
        createTime: record.createTime
      },
      relationIndex: relationIndex >= 0 ? relationIndex : 0,
      monthIndex: monthIndex >= 0 ? monthIndex : 0,
      dayOptions,
      dayIndex: dayIndex >= 0 ? dayIndex : 0,
      remindIndex: remindIndex >= 0 ? remindIndex : 1,
      pageTitle: '编辑生日'
    })
  },

  resetForm() {
    this.setData({
      form: createEmptyForm(),
      dayOptions: buildDayOptions(1),
      relationIndex: 0,
      monthIndex: 0,
      dayIndex: 0,
      remindIndex: 1,
      pageTitle: '添加生日'
    })
  },

  onNameInput(event) {
    this.setData({
      'form.name': event.detail.value
    })
  },

  onContactInput(event) {
    this.setData({
      'form.contact': event.detail.value
    })
  },

  onNoteInput(event) {
    this.setData({
      'form.note': event.detail.value
    })
  },

  onRelationChange(event) {
    const relationIndex = Number(event.detail.value)
    this.setData({
      relationIndex,
      'form.relation': relationOptions[relationIndex]
    })
  },

  onMonthChange(event) {
    const monthIndex = Number(event.detail.value)
    const month = monthOptions[monthIndex]
    const dayOptions = buildDayOptions(month)
    let day = this.data.form.day

    if (!dayOptions.includes(day)) {
      day = dayOptions[dayOptions.length - 1]
    }

    this.setData({
      monthIndex,
      dayOptions,
      dayIndex: dayOptions.indexOf(day),
      'form.month': month,
      'form.day': day
    })
  },

  onDayChange(event) {
    const dayIndex = Number(event.detail.value)
    this.setData({
      dayIndex,
      'form.day': this.data.dayOptions[dayIndex]
    })
  },

  onRemindChange(event) {
    const remindIndex = Number(event.detail.value)
    this.setData({
      remindIndex,
      'form.remindDays': remindOptions[remindIndex]
    })
  },

  submitForm() {
    const store = getStore()
    const form = this.data.form

    if (!String(form.name || '').trim()) {
      wx.showToast({
        title: '请先填写姓名',
        icon: 'none'
      })
      return
    }

    const record = {
      id: form.id || `b${Date.now()}`,
      name: form.name.trim(),
      relation: form.relation,
      month: form.month,
      day: form.day,
      remindDays: form.remindDays,
      contact: form.contact.trim(),
      note: form.note.trim(),
      createTime: form.createTime || dateUtil.formatCreateTime(new Date())
    }

    if (form.id) {
      store.updateBirthday(record)
    } else {
      store.addBirthday(record)
    }

    wx.showToast({
      title: form.id ? '保存成功' : '添加成功',
      icon: 'success'
    })

    setTimeout(() => {
      this.resetForm()
      wx.switchTab({
        url: '/pages/list/list'
      })
    }, 500)
  }
})
