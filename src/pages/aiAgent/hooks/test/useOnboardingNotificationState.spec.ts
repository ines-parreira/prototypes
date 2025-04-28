import { useGetOrCreateOnboardingNotificationState } from 'models/aiAgent/queries'
import {
    OnboardingNotificationState,
    OnboardingNotificationStateResponse,
} from 'models/aiAgent/types'
import { renderHook } from 'utils/testing/renderHook'

import { getOnboardingNotificationStateFixture } from '../../fixtures/onboardingNotificationState.fixture'
import { useOnboardingNotificationState } from '../useOnboardingNotificationState'

jest.mock('models/aiAgent/queries')

const accountDomain = 'test-account'
const shopName = 'test-shop'
const mockedOnboardingNotificationState: OnboardingNotificationState =
    getOnboardingNotificationStateFixture({ shopName })

describe('useOnboardingNotificationState', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    const renderUseOnboardingNotificationStateHook = () => {
        return renderHook(() =>
            useOnboardingNotificationState({ accountDomain, shopName }),
        )
    }

    const mockUseGetOrCreateOnboardingNotificationState = (
        data?: OnboardingNotificationStateResponse,
    ) => {
        ;(
            useGetOrCreateOnboardingNotificationState as jest.Mock
        ).mockReturnValue({
            isLoading: data === undefined,
            data: data !== undefined ? { data } : undefined,
        })
    }

    it('should return loading state correctly', () => {
        mockUseGetOrCreateOnboardingNotificationState()
        const { result } = renderUseOnboardingNotificationStateHook()
        expect(result.current).toEqual({
            isLoading: true,
            onboardingNotificationState: undefined,
        })
    })

    it('should return the onboarding notification state data', () => {
        const data: OnboardingNotificationStateResponse = {
            onboardingNotificationState: mockedOnboardingNotificationState,
        }
        mockUseGetOrCreateOnboardingNotificationState(data)
        const { result } = renderUseOnboardingNotificationStateHook()
        expect(result.current).toEqual({
            isLoading: false,
            onboardingNotificationState: data.onboardingNotificationState,
        })
    })
})
