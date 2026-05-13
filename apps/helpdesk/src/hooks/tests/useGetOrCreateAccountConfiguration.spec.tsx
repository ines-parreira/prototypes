import { assumeMock, renderHook } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'

import { useGetOrCreateAccountConfiguration } from 'hooks/aiAgent/useGetOrCreateAccountConfiguration'
import {
    createAccountConfiguration,
    getAccountConfiguration,
} from 'models/aiAgent/resources/configuration'
import { getAccountConfigurationFixture } from 'pages/aiAgent/fixtures/accountConfiguration.fixture'

const ACCOUNT_ID = 123
const ACCOUNT_DOMAIN = 'test-account'
const STORE_NAMES = ['test-store']

jest.mock('models/aiAgent/resources/configuration', () => ({
    getAccountConfiguration: jest.fn(),
    createAccountConfiguration: jest.fn(),
}))

const mockGetAccountConfiguration = assumeMock(getAccountConfiguration)
const mockCreateAccountConfiguration = assumeMock(createAccountConfiguration)

describe('useGetOrCreateAccountConfiguration', () => {
    const mockData = getAccountConfigurationFixture({
        accountId: ACCOUNT_ID,
        gorgiasDomain: ACCOUNT_DOMAIN,
    })

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should return account configuration if it exists', async () => {
        mockGetAccountConfiguration.mockResolvedValueOnce({
            data: { accountConfiguration: mockData },
            status: 200,
        } as unknown as ReturnType<typeof getAccountConfiguration>)

        const { result } = renderHook(() =>
            useGetOrCreateAccountConfiguration({
                accountId: ACCOUNT_ID,
                accountDomain: ACCOUNT_DOMAIN,
                storeNames: STORE_NAMES,
            }),
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

        const { result } = renderHook(() =>
            useGetOrCreateAccountConfiguration({
                accountId: ACCOUNT_ID,
                accountDomain: ACCOUNT_DOMAIN,
                storeNames: STORE_NAMES,
            }),
        )

        const toastEl = await screen.findByRole('status', {
            name: 'Initializing AI Agent',
        })
        expect(toastEl).toHaveAttribute('data-intent', 'info')

        await waitFor(() => {
            expect(getAccountConfiguration).toHaveBeenCalledWith(ACCOUNT_DOMAIN)
            expect(createAccountConfiguration).toHaveBeenCalledWith({
                accountId: ACCOUNT_ID,
                gorgiasDomain: ACCOUNT_DOMAIN,
                storeNames: STORE_NAMES,
                helpdeskOAuth: null,
                customFieldIds: [],
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

        const { result } = renderHook(() =>
            useGetOrCreateAccountConfiguration({
                accountId: ACCOUNT_ID,
                accountDomain: ACCOUNT_DOMAIN,
                storeNames: STORE_NAMES,
            }),
        )

        const toastEl = await screen.findByRole('status', {
            name: 'An error occurred while loading the AI Agent',
        })
        expect(toastEl).toHaveAttribute('data-intent', 'destructive')

        await waitFor(() => {
            expect(result.current.error).toBeDefined()
        })
    })

    it('should not fetch data when overrides.enabled is false', async () => {
        const { result } = renderHook(() =>
            useGetOrCreateAccountConfiguration(
                {
                    accountId: ACCOUNT_ID,
                    accountDomain: ACCOUNT_DOMAIN,
                    storeNames: STORE_NAMES,
                },
                { enabled: false },
            ),
        )

        await waitFor(() => {
            expect(result.current.data).toBeUndefined()
            expect(getAccountConfiguration).not.toHaveBeenCalled()
            expect(createAccountConfiguration).not.toHaveBeenCalled()
        })
    })
})
