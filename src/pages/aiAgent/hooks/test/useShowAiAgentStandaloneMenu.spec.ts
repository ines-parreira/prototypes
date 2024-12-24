import {renderHook} from '@testing-library/react-hooks'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'

import {useShowAiAgentStandaloneMenu} from '../useShowAiAgentStandaloneMenu'

jest.mock('launchdarkly-react-client-sdk')
const mockUseFlags = jest.mocked(useFlags)

describe('useShowAiAgentStandaloneMenu', () => {
    it('should return true if flag is enabled', () => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.ConvAiStandaloneMenu]: true,
        })

        const {result} = renderHook(() => useShowAiAgentStandaloneMenu())

        expect(result.current).toEqual(true)
    })

    it('should return false if flag is disabled', () => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.ConvAiStandaloneMenu]: false,
        })

        const {result} = renderHook(() => useShowAiAgentStandaloneMenu())

        expect(result.current).toEqual(false)
    })
})
