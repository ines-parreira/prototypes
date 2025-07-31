import { renderHook } from '@repo/testing'
import { useQueryClient } from '@tanstack/react-query'

import {
    useCreateOnboardingNotificationState,
    useUpsertOnboardingNotificationState,
} from 'models/aiAgent/queries'
import { AiAgentOnboardingState } from 'models/aiAgent/types'

import { getOnboardingNotificationStateFixture } from '../../fixtures/onboardingNotificationState.fixture'
import { useOnboardingNotificationStateMutation } from '../useOnboardingNotificationStateMutation'

jest.mock('@tanstack/react-query', () => ({
    useQueryClient: jest.fn(),
}))

jest.mock('models/aiAgent/queries', () => ({
    useCreateOnboardingNotificationState: jest.fn(),
    useUpsertOnboardingNotificationState: jest.fn(),
}))

const accountDomain = 'test-account'
const shopName = 'test-store'

const mockedOnboardingNotificationState = getOnboardingNotificationStateFixture(
    {
        shopName,
    },
)

describe('useOnboardingNotificationStateMutation', () => {
    const queryClientMock = {
        invalidateQueries: jest.fn(),
    }

    beforeEach(() => {
        jest.resetAllMocks()
        ;(useQueryClient as jest.Mock).mockReturnValue(queryClientMock)
        ;(useCreateOnboardingNotificationState as jest.Mock).mockReturnValue({
            isLoading: false,
            mutateAsync: jest.fn().mockResolvedValue({
                data: {
                    onboardingNotificationState:
                        mockedOnboardingNotificationState,
                },
            }),
        })
        ;(useUpsertOnboardingNotificationState as jest.Mock).mockReturnValue({
            isLoading: false,
            mutateAsync: jest.fn().mockResolvedValue({
                data: {
                    onboardingNotificationState:
                        mockedOnboardingNotificationState,
                },
            }),
        })
    })

    it('should return isLoading, createOnboardingNotificationState and upsertOnboardingNotificationState', async () => {
        const { result } = renderHook(() =>
            useOnboardingNotificationStateMutation({ accountDomain, shopName }),
        )

        expect(result.current.isLoading).toBe(false)
        expect(result.current.createOnboardingNotificationState).toBeInstanceOf(
            Function,
        )
        expect(result.current.upsertOnboardingNotificationState).toBeInstanceOf(
            Function,
        )
        const createRes =
            await result.current.createOnboardingNotificationState({
                shopName,
                onboardingState: AiAgentOnboardingState.Activated,
            })
        expect(createRes).toBe(mockedOnboardingNotificationState)

        const upsertRes =
            await result.current.upsertOnboardingNotificationState(
                mockedOnboardingNotificationState,
            )
        expect(upsertRes).toBe(mockedOnboardingNotificationState)
    })

    it('should handle the loading state correctly', () => {
        ;(useCreateOnboardingNotificationState as jest.Mock).mockReturnValue({
            isLoading: true,
            mutateAsync: jest.fn(),
        })
        ;(useUpsertOnboardingNotificationState as jest.Mock).mockReturnValue({
            isLoading: true,
            mutateAsync: jest.fn(),
        })

        const { result } = renderHook(() =>
            useOnboardingNotificationStateMutation({ accountDomain, shopName }),
        )

        expect(result.current.isLoading).toBe(true)
    })
})
