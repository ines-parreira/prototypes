import {INTEGRATION_REMOVAL_CONFIGURATION_TEXT} from 'pages/integrations/integration/constants'
import {getRemovalConfirmationMessageWithSavedFiltersText} from 'pages/integrations/integration/utils'

describe('getRemovalConfirmationMessageWithSavedFiltersText', () => {
    it('should return base text when isSavedFilters is false', () => {
        const result = getRemovalConfirmationMessageWithSavedFiltersText(
            false,
            'Additional text'
        )
        expect(result).toBe(INTEGRATION_REMOVAL_CONFIGURATION_TEXT)
    })

    it('should return combined text when isSavedFilters is true', () => {
        const additionalText = 'and saved filters will be deleted'
        const result = getRemovalConfirmationMessageWithSavedFiltersText(
            true,
            additionalText
        )
        expect(result).toBe(
            `${INTEGRATION_REMOVAL_CONFIGURATION_TEXT} ${additionalText}`
        )
    })

    it('should handle empty additional text when isSavedFilters is true', () => {
        const result = getRemovalConfirmationMessageWithSavedFiltersText(
            true,
            ''
        )
        expect(result).toBe(`${INTEGRATION_REMOVAL_CONFIGURATION_TEXT} `)
    })
})
