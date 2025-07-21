import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'

import { useGetOrCreateAccountConfiguration } from 'hooks/aiAgent/useGetOrCreateAccountConfiguration'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    createAccountConfiguration,
    getAccountConfiguration,
} from 'models/aiAgent/resources/configuration'
import { getAccountConfigurationFixture } from 'pages/aiAgent/fixtures/accountConfiguration.fixture'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

const ACCOUNT_ID = 123
const ACCOUNT_DOMAIN = 'test-account'
const STORE_NAMES = ['test-store']

jest.mock('models/aiAgent/resources/configuration', () => ({
    getAccountConfiguration: jest.fn(),
    createAccountConfiguration: jest.fn(),
}))

const mockGetAccountConfiguration = assumeMock(getAccountConfiguration)
const mockCreateAccountConfiguration = assumeMock(createAccountConfiguration)

jest.mock('state/notifications/actions')

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = assumeMock(useAppDispatch)

const queryClient = mockQueryClient()
const wrapper = ({ children }: any) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('useGetOrCreateAccountConfiguration', () => {
    const dispatchMock = jest.fn()
    const mockData = getAccountConfigurationFixture({
        accountId: ACCOUNT_ID,
        gorgiasDomain: ACCOUNT_DOMAIN,
    })

    beforeEach(() => {
        jest.resetAllMocks()
        queryClient.clear()
        useAppDispatchMock.mockReturnValue(dispatchMock)
    })

    it('should return account configuration if it exists', async () => {
        mockGetAccountConfiguration.mockResolvedValueOnce({
            data: { accountConfiguration: mockData },
            status: 200,
        } as unknown as ReturnType<typeof getAccountConfiguration>)

        const { result } = renderHook(
            () =>
                useGetOrCreateAccountConfiguration({
                    accountId: ACCOUNT_ID,
                    accountDomain: ACCOUNT_DOMAIN,
                    storeNames: STORE_NAMES,
                }),
            { wrapper },
        )

        await waitFor(() => {
            expect(getAccountConfiguration).toHaveBeenCalledWith(ACCOUNT_DOMAIN)
            expect(result.current.data).toEqual({
                data: { accountConfiguration: mockData },
                status: 200,
            })
        })
    })

    it('should create a new account configuration if 404 is returned', async () => {
        mockGetAccountConfiguration.mockRejectedValueOnce({
            isAxiosError: true,
            response: { status: 404 },
        })
        mockCreateAccountConfiguration.mockResolvedValueOnce({
            data: { accountConfiguration: mockData },
            status: 201,
        } as unknown as ReturnType<typeof createAccountConfiguration>)

        const { result } = renderHook(
            () =>
                useGetOrCreateAccountConfiguration({
                    accountId: ACCOUNT_ID,
                    accountDomain: ACCOUNT_DOMAIN,
                    storeNames: STORE_NAMES,
                }),
            { wrapper },
        )

        await waitFor(() => {
            expect(getAccountConfiguration).toHaveBeenCalledWith(ACCOUNT_DOMAIN)
            expect(notify).toHaveBeenCalledWith({
                message: 'Initializing AI Agent',
                status: NotificationStatus.Loading,
                closeOnNext: true,
            })
            expect(createAccountConfiguration).toHaveBeenCalledWith({
                accountId: ACCOUNT_ID,
                gorgiasDomain: ACCOUNT_DOMAIN,
                storeNames: STORE_NAMES,
                helpdeskOAuth: null,
            })
            expect(result.current.data).toEqual({
                data: { accountConfiguration: mockData },
                status: 201,
            })
        })
    })

    it('should notify error if an error that is not an axios error occured', async () => {
        mockGetAccountConfiguration.mockRejectedValueOnce(
            new Error('API error'),
        )

        const { result } = renderHook(
            () =>
                useGetOrCreateAccountConfiguration({
                    accountId: ACCOUNT_ID,
                    accountDomain: ACCOUNT_DOMAIN,
                    storeNames: STORE_NAMES,
                }),
            { wrapper },
        )

        await waitFor(() => {
            expect(notify).toHaveBeenCalledWith({
                message: 'An error occurred while loading the AI Agent',
                status: NotificationStatus.Error,
            })
            expect(result.current.error).toBeDefined()
        })
    })

    it('should not fetch data when overrides.enabled is false', async () => {
        const { result } = renderHook(
            () =>
                useGetOrCreateAccountConfiguration(
                    {
                        accountId: ACCOUNT_ID,
                        accountDomain: ACCOUNT_DOMAIN,
                        storeNames: STORE_NAMES,
                    },
                    { enabled: false },
                ),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.data).toBeUndefined()
            expect(getAccountConfiguration).not.toHaveBeenCalled()
            expect(createAccountConfiguration).not.toHaveBeenCalled()
        })
    })
})
