import { QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react-hooks'
import { createMemoryHistory } from 'history'
import { Router } from 'react-router-dom'

import { createIntegration } from '@gorgias/api-client'
import {
    CreateIntegrationBody,
    PhoneFunction,
    PhoneIntegration,
} from '@gorgias/api-queries'

import { DEFAULT_IVR_SETTINGS } from 'models/integration/constants'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

import { PHONE_INTEGRATION_BASE_URL } from '../../constants'
import {
    useOnboardingForm,
    validateOnboardingForm,
} from '../useVoiceOnboardingForm'

jest.mock('@gorgias/api-client')
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
            data: { name: 'Test Integration' },
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

        expect(mockNotify.success).toHaveBeenCalledWith(
            'Test Integration successfully created.',
        )
        expect(history.location.pathname).toBe(PHONE_INTEGRATION_BASE_URL)
        expect(createIntegrationMock).toHaveBeenCalledWith(
            data as CreateIntegrationBody,
            undefined,
        )
    })

    it('should call createIntegration with correct data for IVR', async () => {
        createIntegrationMock.mockResolvedValue({
            data: { name: 'Test Integration' },
        } as any)

        const { result } = renderUseOnboardingForm()
        const data: PhoneIntegration = {
            name: 'Test Integration',
            meta: {
                phone_number_id: 1,
                function: PhoneFunction.Ivr,
            },
        } as any

        await act(async () => {
            result.current.onSubmit(data)
        })

        expect(mockNotify.success).toHaveBeenCalledWith(
            'Test Integration successfully created.',
        )
        expect(history.location.pathname).toBe(PHONE_INTEGRATION_BASE_URL)
        expect(createIntegrationMock).toHaveBeenCalledWith(
            {
                ...data,
                meta: { ...data.meta, ivr: DEFAULT_IVR_SETTINGS },
            },
            undefined,
        )
    })

    it('should show error notification on createIntegration error', async () => {
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
