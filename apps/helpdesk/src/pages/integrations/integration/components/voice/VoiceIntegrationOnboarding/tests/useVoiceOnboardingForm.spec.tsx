import { FeatureFlagKey } from '@repo/feature-flags'
import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { Router } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

import { createIntegration } from '@gorgias/helpdesk-client'
import type {
    CreateIntegrationBody,
    PhoneIntegration,
} from '@gorgias/helpdesk-queries'
import { PhoneFunction } from '@gorgias/helpdesk-queries'

import { useFlag } from 'core/flags'
import useAppDispatch from 'hooks/useAppDispatch'
import { DEFAULT_IVR_SETTINGS } from 'models/integration/constants'
import { fetchIntegrations } from 'state/integrations/actions'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { PHONE_INTEGRATION_BASE_URL } from '../../constants'
import {
    DEFAULT_TTS_GENDER,
    DEFAULT_TTS_LANGUAGE,
} from '../../VoiceMessageTTS/constants'
import { SUCCESSFUL_ONBOARDING_PARAM, VOICEMAIL_FLOW_STEP } from '../constants'
import {
    useOnboardingForm,
    validateOnboardingForm,
} from '../useVoiceOnboardingForm'

jest.mock('uuid')
const mockUuid = assumeMock(uuidv4)

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

jest.mock('core/flags', () => ({
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

    it('should call createIntegration with correct data when ExtendedCallFlows is enabled', async () => {
        useFlagMock.mockImplementation((flag) => {
            if (flag === 'extended-call-flows-ga-ready') return false
            if (flag === 'extended-call-flows') return true
            return false
        })
        mockUuid.mockReturnValue('voicemail')
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
        expect(mockDispatch).toHaveBeenCalledWith('mockFetchIntegrations')
        expect(history.location.pathname).toBe(PHONE_INTEGRATION_BASE_URL)
        expect(createIntegrationMock).toHaveBeenCalledWith(
            {
                ...data,
                meta: {
                    ...data.meta,
                    flow: {
                        first_step_id: 'voicemail',
                        steps: { voicemail: VOICEMAIL_FLOW_STEP },
                    },
                },
            },
            undefined,
        )
    })

    it('should call createIntegration with correct data for IVR when ExtendedCallFlows is enabled', async () => {
        useFlagMock.mockImplementation((flag) => {
            if (flag === 'extended-call-flows-ga-ready') return false
            if (flag === 'extended-call-flows') return true
            return false
        })
        mockUuid
            .mockReturnValueOnce('business_hours')
            .mockReturnValueOnce('ivr_menu')
            .mockReturnValueOnce('instructions_1')
            .mockReturnValueOnce('instructions_2')
            .mockReturnValueOnce('voicemail')
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
                meta: {
                    ...data.meta,
                    function: PhoneFunction.Standard,
                    flow: {
                        first_step_id: 'business_hours',
                        steps: {
                            business_hours: {
                                id: 'business_hours',
                                name: 'Business Hours',
                                step_type: 'time_split_conditional',
                                on_true_step_id: 'ivr_menu',
                                on_false_step_id: 'voicemail',
                            },
                            ivr_menu: {
                                id: 'ivr_menu',
                                name: 'IVR Menu',
                                step_type: 'ivr_menu',
                                message: {
                                    language: DEFAULT_TTS_LANGUAGE,
                                    gender: DEFAULT_TTS_GENDER,
                                    voice_message_type: 'text_to_speech',
                                    text_to_speech_content:
                                        'Hello, thanks for calling. This IVR number was not fully configured. Press 1 for set up instructions. Press 2 for more.',
                                },
                                branch_options: [
                                    {
                                        input_digit: '1',
                                        branch_name: 'IVR 1 instructions',
                                        next_step_id: 'instructions_1',
                                    },
                                    {
                                        input_digit: '2',
                                        branch_name: 'IVR 2 instructions',
                                        next_step_id: 'instructions_2',
                                    },
                                ],
                            },
                            instructions_1: {
                                id: 'instructions_1',
                                name: 'IVR instructions (1)',
                                step_type: 'play_message',
                                message: {
                                    language: DEFAULT_TTS_LANGUAGE,
                                    gender: DEFAULT_TTS_GENDER,
                                    voice_message_type: 'text_to_speech',
                                    text_to_speech_content:
                                        'You can update IVR menu options on the Call flow page.',
                                },
                                next_step_id: null,
                            },
                            instructions_2: {
                                id: 'instructions_2',
                                name: 'IVR instructions (2)',
                                step_type: 'play_message',
                                message: {
                                    language: DEFAULT_TTS_LANGUAGE,
                                    gender: DEFAULT_TTS_GENDER,
                                    voice_message_type: 'text_to_speech',
                                    text_to_speech_content:
                                        'By default, the call will go to voicemail outside business hours.',
                                },
                                next_step_id: null,
                            },
                            voicemail: VOICEMAIL_FLOW_STEP,
                        },
                    },
                },
            },
            undefined,
        )
    })

    it('should call createIntegration with correct data when ExtendedCallFlowsGAReady is enabled', async () => {
        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.ExtendedCallFlowsGAReady) return true
            return false
        })
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

    it('should call createIntegration with correct data when both flags are off', async () => {
        useFlagMock.mockReturnValue(false)
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
        expect(mockDispatch).toHaveBeenCalledWith('mockFetchIntegrations')
        expect(history.location.pathname).toBe(PHONE_INTEGRATION_BASE_URL)
        expect(createIntegrationMock).toHaveBeenCalledWith(
            data as CreateIntegrationBody,
            undefined,
        )
    })

    it('should call createIntegration with IVR settings when both flags are off and function is IVR', async () => {
        useFlagMock.mockReturnValue(false)
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
