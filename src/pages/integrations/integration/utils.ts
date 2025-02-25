import { INTEGRATION_REMOVAL_CONFIGURATION_TEXT } from 'pages/integrations/integration/constants'

export const getRemovalConfirmationMessageWithSavedFiltersText = (
    isSavedFilters: boolean,
    additionalText: string,
) => {
    if (isSavedFilters) {
        return `${INTEGRATION_REMOVAL_CONFIGURATION_TEXT} ${additionalText}`
    }
    return INTEGRATION_REMOVAL_CONFIGURATION_TEXT
}
