import {renderHook} from '@testing-library/react-hooks'
import LD from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'

import useIsCampaignProritizationEnabled from '../useIsCampaignProritizationEnabled'

describe('useIsCampaignProritizationEnabled', () => {
    it('feature flag is enabled', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ConvertCampaignProritization]: true,
        }))
        const {result} = renderHook(() => useIsCampaignProritizationEnabled())
        expect(result.current).toBe(true)
    })

    it('feature flag is disabled', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ConvertCampaignProritization]: false,
        }))
        const {result} = renderHook(() => useIsCampaignProritizationEnabled())
        expect(result.current).toBe(false)
    })
})
