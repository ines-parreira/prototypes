import {normalizeLocale, processWhatsAppMarkdown} from '../whatsapp/utils'

describe('whatsAppUtils', () => {
    describe('processWhatsAppMarkdown', () => {
        it('should return correct message when message does not contain markdown', () => {
            const message = 'This is a test message'
            expect(processWhatsAppMarkdown(message)).toEqual(message)
        })

        it('should return correct message when message contains bold text', () => {
            const message = '*This is a test message*'
            const expected = '<b>This is a test message</b>'
            expect(processWhatsAppMarkdown(message)).toEqual(expected)
        })

        it('should return correct message when message contains italic text', () => {
            const message = '_This is a test message_'
            const expected = '<i>This is a test message</i>'
            expect(processWhatsAppMarkdown(message)).toEqual(expected)
        })

        it('should return correct message when message contains strikethrough text', () => {
            const message = '~This is a test message~'
            const expected = '<s>This is a test message</s>'
            expect(processWhatsAppMarkdown(message)).toEqual(expected)
        })

        it('should return correct message when message contains urls', () => {
            const message = 'This is a test message https://www.google.com'
            const expected =
                'This is a test message <a href="https://www.google.com" target="_blank" rel="noopener noreferrer" >https://www.google.com</a>'
            expect(processWhatsAppMarkdown(message)).toEqual(expected)
        })

        it('should return correct message when message contains urls and markdown', () => {
            const message = `This is a test message https://www.google.com *bold* _italic_ ~strikethrough~ *_boldAndItalic_* and _*italicAndBold*_ and ~*strikethroughAndBold*~ and ~_*strikethroughAndItalicAndBold*_~`
            const expected =
                'This is a test message <a href="https://www.google.com" target="_blank" rel="noopener noreferrer" >https://www.google.com</a> <b>bold</b> <i>italic</i> <s>strikethrough</s> <b><i>boldAndItalic</i></b> and <i><b>italicAndBold</b></i> and <s><b>strikethroughAndBold</b></s> and <s><i><b>strikethroughAndItalicAndBold</b></i></s>'
            expect(processWhatsAppMarkdown(message)).toEqual(expected)
        })
    })

    describe('normalizeLocale', () => {
        it('should transform locales from localeString_countryCode to localeString-countryCode', () => {
            expect(normalizeLocale('en_US')).toEqual('en-us')
        })
        it('should return locale string when there is no country code', () => {
            expect(normalizeLocale('en')).toEqual('en')
        })
    })
})
