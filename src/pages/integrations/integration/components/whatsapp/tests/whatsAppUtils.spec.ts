import {TicketChannel} from 'business/types/ticket'
import {TicketMessage} from 'models/ticket/types'
import * as dateUtils from 'utils/date'
import {
    normalizeLocale,
    countDistinctVariables,
    isWhatsAppMessageValid,
    isWhatsAppWindowOpen,
} from '../utils'

describe('whatsAppUtils', () => {
    describe('countDistinctVariables', () => {
        it('should return correct number of variables when message does not contain variables', () => {
            const message = 'This is a test message'
            expect(countDistinctVariables(message)).toEqual(0)
        })

        it('should return correct number when message contains one variable', () => {
            const message = 'This is a test message with {{1}}'
            expect(countDistinctVariables(message)).toEqual(1)
        })

        it('should return correct number when message contains multiple variables', () => {
            const message = 'This is a test message with {{1}} and {{2}}'
            expect(countDistinctVariables(message)).toEqual(2)
        })

        it('should return correct number when variables are unordered', () => {
            const message = 'This is a test message with {{2}} and {{1}}'
            expect(countDistinctVariables(message)).toEqual(2)
        })

        it('should return correct number when variables are repeated', () => {
            const message = 'This is a test message with {{1}} and {{1}}'
            expect(countDistinctVariables(message)).toEqual(1)
        })

        it('should return correct number when variables are repeated and unordered', () => {
            const message =
                'This is a test message with {{2}} and {{1}} and {{2}}'
            expect(countDistinctVariables(message)).toEqual(2)
        })
    })

    describe('isWhatsAppMessageValid', () => {
        it('should return true when message does not contain variables', () => {
            const message = 'This is a test message'
            const values: string[] = []
            expect(isWhatsAppMessageValid(message, values)).toEqual(true)
        })

        it('should return true when message contains one variable and one value', () => {
            const message = 'This is a test message with {{1}}'
            const values = ['test']
            expect(isWhatsAppMessageValid(message, values)).toEqual(true)
        })

        it('should return true when message contains multiple variables and multiple values', () => {
            const message = 'This is a test message with {{1}} and {{2}}'
            const values = ['test', 'message']
            expect(isWhatsAppMessageValid(message, values)).toEqual(true)
        })

        it('should return false when message contains one variable and no values', () => {
            const message = 'This is a test message with {{1}}'
            const values: string[] = []
            expect(isWhatsAppMessageValid(message, values)).toEqual(false)
        })

        it('should return false when message contains multiple variables and one value', () => {
            const message = 'This is a test message with {{1}} and {{2}}'
            const values = ['test']
            expect(isWhatsAppMessageValid(message, values)).toEqual(false)
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

    describe('isWhatsAppWindowOpen', () => {
        jest.spyOn(dateUtils, 'getMoment').mockImplementation((): any =>
            dateUtils.stringToDatetime('2023-01-10T00:00')
        )

        it('should return false when there is no message sent by customer in ticket', () => {
            expect(isWhatsAppWindowOpen([])).toEqual(false)
        })

        it('should return false when there is no WhatsApp message sent by customer', () => {
            const messages = [
                {
                    channel: TicketChannel.Phone,
                },
            ] as TicketMessage[]

            expect(isWhatsAppWindowOpen(messages)).toEqual(false)
        })

        it(`should return false when there is a WhatsApp message sent by customer but it's older than 24 hours`, () => {
            const messages = [
                {
                    channel: TicketChannel.WhatsApp,
                    created_datetime: '2023-01-08T23:00',
                },
            ] as TicketMessage[]

            expect(isWhatsAppWindowOpen(messages)).toEqual(false)
        })

        it(`should return true when there is a WhatsApp message sent by customer and it's newer than 24 hours`, () => {
            const messages = [
                {
                    channel: TicketChannel.WhatsApp,
                    created_datetime: '2023-01-05T23:00',
                },
                {
                    channel: TicketChannel.WhatsApp,
                    created_datetime: '2023-01-09T23:00',
                },
            ] as TicketMessage[]

            expect(isWhatsAppWindowOpen(messages)).toEqual(true)
        })
    })
})
