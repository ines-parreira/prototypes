import { assumeMock } from '@repo/testing'
import { renderHook } from '@testing-library/react'
import { fromJS } from 'immutable'

import { account } from 'fixtures/account'
import { user } from 'fixtures/users'
import useAppSelector from 'hooks/useAppSelector'
import client from 'models/api/resources'

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

jest.mock('utils/environment', () => ({
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

            await result.current()

            expect(mockPost).toHaveBeenCalledWith(
                TRIAL_EXTENSION_SLACK_NOTIFICATION_ZAPIER_URL,
                {
                    data: {
                        userName: user.name,
                        userEmail: user.email,
                        accountDomain: account.domain,
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

            const response = await result.current()

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

            const response = await result.current()

            expect(response).toBe(false)
        })
    })
})
