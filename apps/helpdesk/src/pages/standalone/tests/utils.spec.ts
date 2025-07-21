import { INTEGRATIONS_MAPPING } from 'pages/standalone/constants'
import { HelpdeskIntegrationOptions } from 'pages/standalone/types'
import { getWebhookRequiredFields } from 'pages/standalone/utils'

describe('standalone utils', () => {
    describe('getWebhookRequiredFields', () => {
        it('should return an object with empty string values for Zendesk required fields', () => {
            const result = getWebhookRequiredFields(
                HelpdeskIntegrationOptions.ZENDESK,
            )

            expect(result).toEqual({
                subdomain: '',
                basicToken: '',
            })

            // Verify that the keys match the required fields from INTEGRATIONS_MAPPING
            const requiredFieldKeys = Object.keys(
                INTEGRATIONS_MAPPING.zendesk.requiredFields,
            )
            expect(Object.keys(result).sort()).toEqual(requiredFieldKeys.sort())
        })

        it('should return an object with empty string values for Intercom required fields', () => {
            const result = getWebhookRequiredFields(
                HelpdeskIntegrationOptions.INTERCOM,
            )

            expect(result).toEqual({
                accessToken: '',
            })

            // Verify that the keys match the required fields from INTEGRATIONS_MAPPING
            const requiredFieldKeys = Object.keys(
                INTEGRATIONS_MAPPING.intercom.requiredFields,
            )
            expect(Object.keys(result).sort()).toEqual(requiredFieldKeys.sort())
        })

        it('should always return an object with empty string values for each required field', () => {
            const zendeskResult = getWebhookRequiredFields(
                HelpdeskIntegrationOptions.ZENDESK,
            )
            const intercomResult = getWebhookRequiredFields(
                HelpdeskIntegrationOptions.INTERCOM,
            )

            // Verify all values are empty strings
            Object.values(zendeskResult).forEach((value) => {
                expect(value).toBe('')
            })

            Object.values(intercomResult).forEach((value) => {
                expect(value).toBe('')
            })
        })
    })
})
