import { ZodIssueCode } from 'zod'

import { handoverSchema } from 'pages/standalone/schemas'
import * as utils from 'utils'

import { HelpdeskIntegrationOptions } from '../types'

jest.mock('utils', () => ({
    isEmail: jest.fn(),
}))

const isEmailMock = jest.mocked(utils.isEmail)

describe('useHandoverSchema', () => {
    beforeEach(() => {
        isEmailMock.mockReset()
    })

    describe('email handover validation', () => {
        it('should pass when email and emailIntegration are valid', () => {
            isEmailMock.mockReturnValue(true)

            const schema = handoverSchema

            const validData = {
                handoverMethod: 'email',
                email: 'test@example.com',
                emailIntegration: 123,
            }

            const outcome = schema.safeParse(validData)

            expect(outcome.success).toBe(true)
            expect(isEmailMock).toHaveBeenCalledWith('test@example.com')
        })

        it('should fail when email is missing', () => {
            const schema = handoverSchema

            const invalidData = {
                handoverMethod: 'email',
                emailIntegration: 123,
            }

            const outcome = schema.safeParse(invalidData)

            expect(outcome.success).toBe(false)
            if (!outcome.success) {
                const emailError = outcome.error.issues.find(
                    (issue) => issue.path[0] === 'email',
                )
                expect(emailError).toBeDefined()
                expect(emailError?.message).toBe(
                    'Email is required for email handover.',
                )
                expect(emailError?.code).toBe(ZodIssueCode.custom)
            }
        })

        it('should fail when email is invalid', () => {
            isEmailMock.mockReturnValue(false)

            const schema = handoverSchema

            const invalidData = {
                handoverMethod: 'email',
                email: 'invalid-email',
                emailIntegration: 123,
            }

            const outcome = schema.safeParse(invalidData)

            expect(outcome.success).toBe(false)
            if (!outcome.success) {
                const emailError = outcome.error.issues.find(
                    (issue) => issue.path[0] === 'email',
                )
                expect(emailError).toBeDefined()
                expect(emailError?.message).toBe(
                    'Email format must include @ and a domain, e.g. example@domain.com.',
                )
                expect(emailError?.code).toBe(ZodIssueCode.custom)
            }
        })

        it('should fail when emailIntegration is missing', () => {
            isEmailMock.mockReturnValue(true)

            const schema = handoverSchema

            const invalidData = {
                handoverMethod: 'email',
                email: 'test@example.com',
            }

            const outcome = schema.safeParse(invalidData)

            expect(outcome.success).toBe(false)
            if (!outcome.success) {
                const integrationError = outcome.error.issues.find(
                    (issue) => issue.path[0] === 'emailIntegration',
                )
                expect(integrationError).toBeDefined()
                expect(integrationError?.message).toBe(
                    'An outbound email is required for email handover.',
                )
                expect(integrationError?.code).toBe(ZodIssueCode.custom)
            }
        })
    })

    describe('webhook handover validation', () => {
        it('should pass when webhookThirdParty is valid with all required fields', () => {
            const schema = handoverSchema

            const validData = {
                handoverMethod: 'webhook',
                webhookThirdParty: HelpdeskIntegrationOptions.ZENDESK,
                webhookRequiredFields: {
                    subdomain: 'company',
                    basicToken: 'token123',
                },
            }

            const outcome = schema.safeParse(validData)

            expect(outcome.success).toBe(true)
        })

        it('should fail when webhookThirdParty is missing', () => {
            const schema = handoverSchema

            const invalidData = {
                handoverMethod: 'webhook',
            }

            const outcome = schema.safeParse(invalidData)

            expect(outcome.success).toBe(false)
            if (!outcome.success) {
                const thirdPartyError = outcome.error.issues.find(
                    (issue) => issue.path[0] === 'webhookThirdParty',
                )
                expect(thirdPartyError).toBeDefined()
                expect(thirdPartyError?.message).toBe(
                    'An integration is required for webhook handover.',
                )
                expect(thirdPartyError?.code).toBe(ZodIssueCode.custom)
            }
        })

        it('should fail when required webhook fields are missing', () => {
            const schema = handoverSchema

            const invalidData = {
                handoverMethod: 'webhook',
                webhookThirdParty: HelpdeskIntegrationOptions.ZENDESK,
                webhookRequiredFields: {
                    subdomain: '',
                    basicToken: 'token123',
                },
            }

            const outcome = schema.safeParse(invalidData)

            expect(outcome.success).toBe(false)
            if (!outcome.success) {
                const fieldError = outcome.error.issues.find(
                    (issue) =>
                        issue.path[0] === 'webhookRequiredFields' &&
                        issue.path[1] === 'subdomain',
                )
                expect(fieldError).toBeDefined()
                expect(fieldError?.message).toBe(
                    'Subdomain is required for webhook handover.',
                )
                expect(fieldError?.code).toBe(ZodIssueCode.custom)
            }
        })
    })

    describe('other handover validation', () => {
        it('should pass for unknown handover methods', () => {
            const schema = handoverSchema

            const validData = {
                handoverMethod: 'unknownMethod',
            }

            const outcome = schema.safeParse(validData)

            expect(outcome.success).toBe(true)
        })
    })
})
