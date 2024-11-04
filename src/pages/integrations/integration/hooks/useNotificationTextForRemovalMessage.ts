import {useFlags} from 'launchdarkly-react-client-sdk'
import {useMemo} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {INTEGRATION_SAVED_FILTERS_REMOVAL_CONFIRMATION_TEXT} from 'pages/integrations/integration/constants'
import {getRemovalConfirmationMessageWithSavedFiltersText} from 'pages/integrations/integration/utils'

export const useNotificationTextForRemovalMessage = () => {
    const isAnalyticsSavedFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsSavedFilters]

    const message = useMemo(() => {
        return getRemovalConfirmationMessageWithSavedFiltersText(
            isAnalyticsSavedFilters,
            INTEGRATION_SAVED_FILTERS_REMOVAL_CONFIRMATION_TEXT
        )
    }, [isAnalyticsSavedFilters])

    return message
}
