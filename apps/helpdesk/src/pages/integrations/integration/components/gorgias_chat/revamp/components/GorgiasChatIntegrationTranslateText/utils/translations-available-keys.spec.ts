import {
    deleteUnusedKeys,
    translationsAvailableKeys,
} from './translations-available-keys'

describe('deleteUnusedKeys', () => {
    it('should remove all deprecated keys from the object', () => {
        const input = {
            texts: {
                waitTimeShortNoEmail: 'short',
                waitTimeMediumNoEmail: 'medium',
                waitTimeLongNoEmail: 'long',
                emailCaptureOnlineTriggerText: 'trigger',
                emailCaptureThanksText: 'thanks',
                howCanWeHelpToday: 'help',
                emailCaptureTriggerTextBase: 'base',
                thanksForReachingOut: 'reaching out',
                chatTitle: 'My Chat',
            },
            sspTexts: {},
            meta: {},
        }

        const result = deleteUnusedKeys(input)

        expect(result.texts.chatTitle).toBe('My Chat')
        expect(result.texts.waitTimeShortNoEmail).toBeUndefined()
        expect(result.texts.waitTimeMediumNoEmail).toBeUndefined()
        expect(result.texts.waitTimeLongNoEmail).toBeUndefined()
        expect(result.texts.emailCaptureOnlineTriggerText).toBeUndefined()
        expect(result.texts.emailCaptureThanksText).toBeUndefined()
        expect(result.texts.howCanWeHelpToday).toBeUndefined()
        expect(result.texts.emailCaptureTriggerTextBase).toBeUndefined()
        expect(result.texts.thanksForReachingOut).toBeUndefined()
    })

    it('should preserve non-deprecated keys', () => {
        const input = {
            texts: {
                chatTitle: 'My Chat',
                leaveAMessage: 'Leave a message',
                introductionText: 'Welcome!',
            },
            sspTexts: { sendUsAMessage: 'Send us a message' },
            meta: { contactFormEmailIntro: 'Hi' },
        }

        const result = deleteUnusedKeys(input)

        expect(result.texts.chatTitle).toBe('My Chat')
        expect(result.texts.leaveAMessage).toBe('Leave a message')
        expect(result.texts.introductionText).toBe('Welcome!')
        expect(result.sspTexts.sendUsAMessage).toBe('Send us a message')
        expect(result.meta.contactFormEmailIntro).toBe('Hi')
    })

    it('should return the object unchanged when no deprecated keys are present', () => {
        const input = {
            texts: { chatTitle: 'title' },
            sspTexts: {},
            meta: {},
        }

        const result = deleteUnusedKeys(input)

        expect(result).toEqual(input)
    })
})

describe('translationsAvailableKeys filter functions', () => {
    describe('filterByAutomateSubscriber', () => {
        const keyWithAutomateFilter =
            translationsAvailableKeys.dynamicWaitTime[
                'sspTexts.sorryToHearThatEmailNotRequired'
            ]

        it('should return true when isAutomateSubscriber is true', () => {
            expect(
                keyWithAutomateFilter.filteredBy?.({
                    isAutomateSubscriber: true,
                }),
            ).toBe(true)
        })

        it('should return false when isAutomateSubscriber is false', () => {
            expect(
                keyWithAutomateFilter.filteredBy?.({
                    isAutomateSubscriber: false,
                }),
            ).toBe(false)
        })

        it('should return false when isAutomateSubscriber is undefined', () => {
            expect(keyWithAutomateFilter.filteredBy?.({})).toBe(false)
        })
    })

    describe('filterByEmailCapture', () => {
        const emailCaptureKey =
            translationsAvailableKeys.emailCapture[
                'texts.requireEmailCaptureIntro'
            ]

        it('should return true when emailCaptureEnforcement is always-required', () => {
            expect(
                emailCaptureKey.filteredBy?.({
                    emailCaptureEnforcement: 'always-required',
                }),
            ).toBe(true)
        })

        it('should return false when emailCaptureEnforcement is not always-required', () => {
            expect(
                emailCaptureKey.filteredBy?.({
                    emailCaptureEnforcement: 'optional',
                }),
            ).toBe(false)
        })

        it('should return false when emailCaptureEnforcement is undefined', () => {
            expect(emailCaptureKey.filteredBy?.({})).toBe(false)
        })
    })
})
