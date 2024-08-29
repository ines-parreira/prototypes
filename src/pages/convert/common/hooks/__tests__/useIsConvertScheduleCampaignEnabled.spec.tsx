import {renderHook} from '@testing-library/react-hooks'
import LD from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'

import {useIsConvertScheduleCampaignEnabled} from '../useIsConvertScheduleCampaignEnabled'

describe('useIsConvertScheduleCampaignEnabled', () => {
    beforeEach(() => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ConvertScheduleCampaign]: true,
        }))
    })

    it('feature flag is enabled', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ConvertScheduleCampaign]: true,
        }))
        const {result} = renderHook(() => useIsConvertScheduleCampaignEnabled())

        expect(result.current).toBe(true)
    })

    it('feature flag is disabled', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ConvertScheduleCampaign]: false,
        }))
        const {result} = renderHook(() => useIsConvertScheduleCampaignEnabled())
        expect(result.current).toBe(false)
    })
})
