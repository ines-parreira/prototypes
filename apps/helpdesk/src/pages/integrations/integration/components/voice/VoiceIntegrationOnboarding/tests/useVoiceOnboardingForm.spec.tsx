import { useFlag } from '@repo/feature-flags'
import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { Router } from 'react-router-dom'

import { createIntegration } from '@gorgias/helpdesk-client'
import type {
    CreateIntegrationBody,
    PhoneIntegration,
} from '@gorgias/helpdesk-queries'
import { PhoneFunction } from '@gorgias/helpdesk-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import { fetchIntegrations } from 'state/integrations/actions'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { PHONE_INTEGRATION_BASE_URL } from '../../constants'
import { SUCCESSFUL_ONBOARDING_PARAM } from '../constants'
import {
    useOnboardingForm,
    validateOnboardingForm,
} from '../useVoiceOnboardingForm'

jest.mock('@gorgias/helpdesk-client')
const createIntegrationMock = assumeMock(createIntegration)

jest.mock('hooks/useNotify')

const queryClient = mockQueryClient()
const mockNotify = {
    success: jest.fn(),
    error: jest.fn(),
}
jest.mock('hooks/useNotify', () => ({
    useNotify: () => mockNotify,
}))

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

    beforeEach(() => {
        useFlagMock.mockReturnValue(false)
        jest.clearAllMocks()
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
        createIntegrationMock.mockResolvedValue({
            data: { id: 123, name: 'Test Integration' },
        } as any)

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

        expect(mockNotify.success).not.toHaveBeenCalled()
        expect(mockDispatch).toHaveBeenCalledWith('mockFetchIntegrations')
        expect(history.location.pathname).toBe(PHONE_INTEGRATION_BASE_URL)
        expect(history.location.search).toBe(
            `?${SUCCESSFUL_ONBOARDING_PARAM}=123`,
        )
        expect(createIntegrationMock).toHaveBeenCalledWith(
            data as CreateIntegrationBody,
            undefined,
        )
    })

    it('should show backend error message on API error', async () => {
        createIntegrationMock.mockRejectedValue({
            isAxiosError: true,
            response: {
                data: {
                    error: {
                        msg: 'Your subscription does not include the Voice product. Please contact support.',
                    },
                },
            },
        })

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

        expect(mockNotify.error).toHaveBeenCalledWith(
            'Your subscription does not include the Voice product. Please contact support.',
        )
    })

    it('should show generic error on non-API error', async () => {
        createIntegrationMock.mockRejectedValue({})

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

        expect(mockNotify.error).toHaveBeenCalledWith(
            "We couldn't save your preferences. Please try again.",
        )
    })
})
