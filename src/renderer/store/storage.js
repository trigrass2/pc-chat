export default {
  getSessionItem(key) {
    try {
      return JSON.parse(sessionStorage.getItem(key))
    } catch (err) {
      return null
    }
  },
  setSessionItem(key, val) {
    try {
      sessionStorage.setItem(key, JSON.stringify(val))
    } catch (e) {}
  },
  getLocalItem(key) {
    try {
      return JSON.parse(localStorage.getItem(key))
    } catch (err) {
      return null
    }
  },
  setLocalItem(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val))
    } catch (err) {
      return null
    }
  }
}
