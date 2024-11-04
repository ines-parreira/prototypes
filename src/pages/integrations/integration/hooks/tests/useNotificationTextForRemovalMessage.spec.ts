import {renderHook} from '@testing-library/react-hooks'
import {mockFlags} from 'jest-launchdarkly-mock'

import {FeatureFlagKey} from 'config/featureFlags'
import {
    INTEGRATION_REMOVAL_CONFIGURATION_TEXT,
    INTEGRATION_SAVED_FILTERS_REMOVAL_CONFIRMATION_TEXT,
} from 'pages/integrations/integration/constants'
import {useNotificationTextForRemovalMessage} from 'pages/integrations/integration/hooks/useNotificationTextForRemovalMessage'

describe('useNotificationTextForRemovalMessage', () => {
    beforeEach(() => {
        mockFlags({
            [FeatureFlagKey.AnalyticsSavedFilters]: false,
        })
    })

    it('should return message without saved filters text when feature flag is disabled', () => {
        const {result} = renderHook(() =>
            useNotificationTextForRemovalMessage()
        )

        expect(result.current).toBe(INTEGRATION_REMOVAL_CONFIGURATION_TEXT)
    })

    it('should return message with saved filters text when feature flag is enabled', () => {
        mockFlags({
            [FeatureFlagKey.AnalyticsSavedFilters]: true,
        })

        const {result} = renderHook(() =>
            useNotificationTextForRemovalMessage()
        )

        expect(result.current).toBe(
            `${INTEGRATION_REMOVAL_CONFIGURATION_TEXT} ${INTEGRATION_SAVED_FILTERS_REMOVAL_CONFIRMATION_TEXT}`
        )
    })
})
