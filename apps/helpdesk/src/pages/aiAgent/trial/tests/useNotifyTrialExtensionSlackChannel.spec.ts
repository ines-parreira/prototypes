import { assumeMock } from '@repo/testing'
import { renderHook } from '@testing-library/react'
import { fromJS } from 'immutable'

import { account } from 'fixtures/account'
import { user } from 'fixtures/users'
import useAppSelector from 'hooks/useAppSelector'
import client from 'models/api/resources'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'

import {
    TRIAL_EXTENSION_SLACK_NOTIFICATION_ZAPIER_URL,
    useNotifyTrialExtensionSlackChannel,
} from '../hooks/useNotifyTrialExtensionSlackChannel'

jest.mock('hooks/useAppSelector', () => jest.fn())
const mockUseAppSelector = assumeMock(useAppSelector)

jest.mock('models/api/resources', () => ({
    post: jest.fn(),
}))

const mockPost = jest.mocked(client.post)

jest.mock('@repo/utils', () => ({
    isProduction: jest.fn().mockReturnValue(false),
}))

jest.mock('state/currentUser/selectors', () => ({
    getCurrentUser: jest.fn(),
}))

jest.mock('state/currentAccount/selectors', () => ({
    getCurrentAccountState: jest.fn(),
}))

jest.mock('common/utils/index', () => ({}))
jest.mock('utils', () => ({}))

const TEST_TRIAL_TYPE = TrialType.AiAgent
const TEST_TRIAL_END_DATE = '2024-12-31T23:59:59Z'

describe('useNotifyTrialExtensionSlackChannel', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('when user and account data are available', () => {
        it('calls the Zapier URL with correct payload', async () => {
            mockPost.mockResolvedValue({})

            mockUseAppSelector
                .mockReturnValueOnce(
                    fromJS({
                        name: user.name,
                        email: user.email,
                    }),
                )
                .mockReturnValueOnce(
                    fromJS({
                        domain: account.domain,
                    }),
                )

            const { result } = renderHook(() =>
                useNotifyTrialExtensionSlackChannel(),
            )

            await result.current(TEST_TRIAL_TYPE, TEST_TRIAL_END_DATE)

            expect(mockPost).toHaveBeenCalledWith(
                TRIAL_EXTENSION_SLACK_NOTIFICATION_ZAPIER_URL,
                {
                    data: {
                        userName: user.name,
                        userEmail: user.email,
                        accountDomain: account.domain,
                        trialType: TEST_TRIAL_TYPE,
                        trialEndDate: TEST_TRIAL_END_DATE,
                    },
                },
                {
                    transformRequest: expect.any(Function),
                },
            )
        })

        it('returns true when notification is sent successfully', async () => {
            mockPost.mockResolvedValue({})

            mockUseAppSelector
                .mockReturnValueOnce(
                    fromJS({
                        name: user.name,
                        email: user.email,
                    }),
                )
                .mockReturnValueOnce(
                    fromJS({
                        domain: account.domain,
                    }),
                )

            const { result } = renderHook(() =>
                useNotifyTrialExtensionSlackChannel(),
            )

            const response = await result.current(
                TEST_TRIAL_TYPE,
                TEST_TRIAL_END_DATE,
            )

            expect(response).toBe(true)
        })

        it('returns false when notification fails', async () => {
            mockPost.mockRejectedValue(new Error('Network error'))

            mockUseAppSelector
                .mockReturnValueOnce(
                    fromJS({
                        name: user.name,
                        email: user.email,
                    }),
                )
                .mockReturnValueOnce(
                    fromJS({
                        domain: account.domain,
                    }),
                )

            const { result } = renderHook(() =>
                useNotifyTrialExtensionSlackChannel(),
            )

            const response = await result.current(
                TEST_TRIAL_TYPE,
                TEST_TRIAL_END_DATE,
            )

            expect(response).toBe(false)
        })

        it('handles null trialEndDate correctly', async () => {
            mockPost.mockResolvedValue({})

            mockUseAppSelector
                .mockReturnValueOnce(
                    fromJS({
                        name: user.name,
                        email: user.email,
                    }),
                )
                .mockReturnValueOnce(
                    fromJS({
                        domain: account.domain,
                    }),
                )

            const { result } = renderHook(() =>
                useNotifyTrialExtensionSlackChannel(),
            )

            await result.current(TEST_TRIAL_TYPE, null)

            expect(mockPost).toHaveBeenCalledWith(
                TRIAL_EXTENSION_SLACK_NOTIFICATION_ZAPIER_URL,
                {
                    data: {
                        userName: user.name,
                        userEmail: user.email,
                        accountDomain: account.domain,
                        trialType: TEST_TRIAL_TYPE,
                        trialEndDate: null,
                    },
                },
                {
                    transformRequest: expect.any(Function),
                },
            )
        })
    })
})
