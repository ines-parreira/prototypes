import {normalizeLocale} from '../whatsapp/utils'

describe('whatsAppUtils', () => {
    describe('normalizeLocale', () => {
        it('should transform locales from localeString_countryCode to localeString-countryCode', () => {
            expect(normalizeLocale('en_US')).toEqual('en-us')
        })
        it('should return locale string when there is no country code', () => {
            expect(normalizeLocale('en')).toEqual('en')
        })
    })
})
