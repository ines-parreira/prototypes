import includes from 'array-includes'
import Promise from 'promise-polyfill'
import '@formatjs/intl-numberformat/polyfill'
import '@formatjs/intl-numberformat/locale-data/en'

Array.prototype.includes = Array.prototype.includes || includes
window.Promise = window.Promise || Promise
