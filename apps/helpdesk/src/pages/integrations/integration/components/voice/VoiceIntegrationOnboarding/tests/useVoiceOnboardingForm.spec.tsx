import { useFlag } from '@repo/feature-flags'
import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, screen } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Router } from 'react-router-dom'

import {
    mockCreateIntegrationHandler,
    mockPhoneIntegration,
} from '@gorgias/helpdesk-mocks'
import type { PhoneIntegration } from '@gorgias/helpdesk-queries'
import { PhoneFunction } from '@gorgias/helpdesk-queries'

import { useAppDispatch } from 'hooks/useAppDispatch'
import { fetchIntegrations } from 'state/integrations/actions'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { PHONE_INTEGRATION_BASE_URL } from '../../constants'
import { SUCCESSFUL_ONBOARDING_PARAM } from '../constants'
import {
    useOnboardingForm,
    validateOnboardingForm,
} from '../useVoiceOnboardingForm'

const createIntegrationHandler = mockCreateIntegrationHandler(async () =>
    HttpResponse.json(
        mockPhoneIntegration({ id: 123, name: 'Test Integration' }),
    ),
)
const server = setupServer(createIntegrationHandler.handler)

const queryClient = mockQueryClient()

jest.mock('hooks/useAppDispatch')
const mockDispatch = jest.fn()
const useAppDispatchMock = assumeMock(useAppDispatch)
useAppDispatchMock.mockReturnValue(mockDispatch)

jest.mock('state/integrations/actions')
const fetchIntegrationsMock = assumeMock(fetchIntegrations)
fetchIntegrationsMock.mockReturnValue('mockFetchIntegrations' as any)

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))
const useFlagMock = assumeMock(useFlag)

describe('validateOnboardingForm', () => {
    it('should return errors when name is empty', () => {
        const values = {
            name: '',
            meta: {
                emoji: null,
                function: PhoneFunction.Standard,
                send_calls_to_voicemail: false,
                phone_number_id: 1,
            },
        }

        const result = validateOnboardingForm(values as any)

        expect(result).toEqual({ name: 'Name is required' })
    })

    it('should return errors when phone number id is empty', () => {
        const values = {
            name: 'name',
            meta: {
                emoji: null,
                function: PhoneFunction.Standard,
                send_calls_to_voicemail: false,
            },
        }

        const result = validateOnboardingForm(values as any)

        expect(result).toEqual({
            meta: { phone_number_id: 'Phone number is required' },
        })
    })

    it('should return errors when meta is invalid', () => {
        const values = {
            name: 'name',
            meta: {
                emoji: 12,
                function: PhoneFunction.Standard,
                send_calls_to_voicemail: false,
            },
        }

        const result = validateOnboardingForm(values as any)

        expect(result).toEqual({
            meta: {
                emoji: "'emoji' property type must be string",
                phone_number_id: 'Phone number is required',
            },
        })
    })
})

describe('useOnboardingForm', () => {
    const history = createMemoryHistory()

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        useFlagMock.mockReturnValue(false)
        jest.clearAllMocks()
        queryClient.clear()
    })

    afterEach(() => {
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
    })

    const renderUseOnboardingForm = () =>
        renderHook(() => useOnboardingForm(), {
            wrapper: ({ children }) => (
                <Router history={history}>
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                </Router>
            ),
        })

    it('should call createIntegration with correct data', async () => {
        const waitForCreateIntegrationRequest =
            createIntegrationHandler.waitForRequest(server)

        const { result } = renderUseOnboardingForm()
        const data: PhoneIntegration = {
            name: 'Test Integration',
            meta: {
                phone_number_id: 1,
                function: PhoneFunction.Standard,
            },
        } as any

        await act(async () => {
            result.current.onSubmit(data)
        })

        await waitForCreateIntegrationRequest(async (request) => {
            expect(new URL(request.url).pathname).toBe('/api/integrations')
            await expect(request.json()).resolves.toEqual(data)
        })

        expect(screen.queryByRole('status')).not.toBeInTheDocument()
        expect(mockDispatch).toHaveBeenCalledWith('mockFetchIntegrations')
        expect(history.location.pathname).toBe(PHONE_INTEGRATION_BASE_URL)
        expect(history.location.search).toBe(
            `?${SUCCESSFUL_ONBOARDING_PARAM}=123`,
        )
    })

    it('should show backend error message on API error', async () => {
        server.use(
            mockCreateIntegrationHandler(async () =>
                HttpResponse.json(
                    {
                        error: {
                            msg: 'Your subscription does not include the Voice product. Please contact support.',
                        },
                    } as never,
                    { status: 400 },
                ),
            ).handler,
        )

        const { result } = renderUseOnboardingForm()
        const data = {
            name: 'Test Integration',
            meta: {
                phone_number_id: 1,
                function: PhoneFunction.Standard,
            },
        } as any

        await act(async () => {
            result.current.onSubmit(data)
        })

        const toastEl = await screen.findByRole('status', {
            name: 'Your subscription does not include the Voice product. Please contact support.',
        })
        expect(toastEl).toHaveAttribute('data-intent', 'destructive')
    })

    it('should show generic error on non-API error', async () => {
        server.use(
            mockCreateIntegrationHandler(async () =>
                HttpResponse.json(null as never, { status: 500 }),
            ).handler,
        )

        const { result } = renderUseOnboardingForm()
        const data = {
            name: 'Test Integration',
            meta: {
                phone_number_id: 1,
                function: PhoneFunction.Standard,
            },
        } as any

        await act(async () => {
            result.current.onSubmit(data)
        })

        const toastEl = await screen.findByRole('status', {
            name: "We couldn't save your preferences. Please try again.",
        })
        expect(toastEl).toHaveAttribute('data-intent', 'destructive')
    })
})
