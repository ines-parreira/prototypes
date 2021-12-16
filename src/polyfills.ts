import includes from 'array-includes'
import Promise from 'promise-polyfill'
import '@formatjs/intl-numberformat/polyfill'
import '@formatjs/intl-numberformat/locale-data/en'
import '@formatjs/intl-pluralrules/polyfill'
import '@formatjs/intl-pluralrules/locale-data/en'

// eslint-disable-next-line @typescript-eslint/unbound-method
Array.prototype.includes = Array.prototype.includes || includes
window.Promise = window.Promise || Promise
