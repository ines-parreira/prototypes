import { history } from '@repo/routing'
import { renderHook } from '@repo/testing'

import { toast } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import { isMigrationInProgress } from 'hooks/useWhatsAppMigration'
import { fetchNewPhoneNumbers } from 'models/phoneNumber/resources'
import { newPhoneNumbersFetched } from 'state/entities/phoneNumbers/actions'
import * as integrationsActions from 'state/integrations/actions'

import {
    useWhatsAppOnboardingRealtimeMessageHandler,
    WHATSAPP_ONBOARDING_FAILED_EVENT,
    WHATSAPP_ONBOARDING_SUCCEEDED_EVENT,
} from '../useWhatsAppOnboardingRealtimeMessageHandler'

jest.mock('@repo/routing', () => ({
    history: {
        push: jest.fn((path: string) => {
            window.history.pushState({}, '', path)
        }),
    },
}))
jest.mock('hooks/useAppDispatch')
jest.mock('hooks/useWhatsAppMigration', () => ({
    isMigrationInProgress: jest.fn(),
}))
jest.mock('models/phoneNumber/resources', () => ({
    fetchNewPhoneNumbers: jest.fn(),
}))
jest.mock('state/entities/phoneNumbers/actions', () => ({
    newPhoneNumbersFetched: jest.fn((payload) => ({
        type: 'newPhoneNumbersFetched',
        payload,
    })),
}))
jest.mock('state/integrations/actions', () => ({
    fetchIntegrations: jest.fn(() => ({ type: 'fetchIntegrations' })),
}))

const mockUseAppDispatch = useAppDispatch as jest.Mock
const mockIsMigrationInProgress = isMigrationInProgress as jest.Mock
const mockFetchNewPhoneNumbers = fetchNewPhoneNumbers as jest.Mock
const mockNewPhoneNumbersFetched =
    newPhoneNumbersFetched as unknown as jest.Mock
const mockFetchIntegrations = integrationsActions.fetchIntegrations as jest.Mock
const mockHistoryPush = history.push as jest.Mock

const dispatch = jest.fn()

type WhatsAppOnboardingRealtimeMessage = Parameters<
    ReturnType<
        typeof useWhatsAppOnboardingRealtimeMessageHandler
    >['handleWhatsAppOnboardingSuccessRealtimeMessage']
>[0]

describe('useWhatsAppOnboardingRealtimeMessageHandler', () => {
    beforeEach(() => {
        window.history.pushState({}, '', '/app/settings/integrations')
        mockUseAppDispatch.mockReturnValue(dispatch)
        mockIsMigrationInProgress.mockReturnValue(false)
        mockFetchNewPhoneNumbers.mockResolvedValue({
            data: [{ id: 1, phone_number: '+123' }],
        })
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    it('handles successful WhatsApp onboarding', async () => {
        const toastSpy = jest.spyOn(toast, 'info')
        const { result } = renderHook(() =>
            useWhatsAppOnboardingRealtimeMessageHandler(),
        )

        await result.current.handleWhatsAppOnboardingSuccessRealtimeMessage({
            name: WHATSAPP_ONBOARDING_SUCCEEDED_EVENT,
            data: JSON.stringify({
                integration_id: 123,
                phone_number: '+123',
            }),
        } as WhatsAppOnboardingRealtimeMessage)

        expect(mockHistoryPush).toHaveBeenCalledWith(
            '/app/settings/integrations/whatsapp/integrations',
        )
        expect(toastSpy).toHaveBeenCalledWith(
            'WhatsApp successfully connected for number +123.',
            { duration: 10000 },
        )
        expect(mockFetchIntegrations).toHaveBeenCalled()
        expect(mockNewPhoneNumbersFetched).toHaveBeenCalledWith([
            { id: 1, phone_number: '+123' },
        ])
        expect(dispatch).toHaveBeenCalledWith({ type: 'fetchIntegrations' })
        expect(dispatch).toHaveBeenCalledWith({
            type: 'newPhoneNumbersFetched',
            payload: [{ id: 1, phone_number: '+123' }],
        })
    })

    it('returns early for successful WhatsApp onboarding when migration is in progress', async () => {
        mockIsMigrationInProgress.mockReturnValue(true)
        const { result } = renderHook(() =>
            useWhatsAppOnboardingRealtimeMessageHandler(),
        )

        await result.current.handleWhatsAppOnboardingSuccessRealtimeMessage({
            name: WHATSAPP_ONBOARDING_SUCCEEDED_EVENT,
            data: JSON.stringify({
                integration_id: 123,
                phone_number: '+123',
            }),
        } as WhatsAppOnboardingRealtimeMessage)

        expect(mockIsMigrationInProgress).toHaveBeenCalled()
        expect(mockHistoryPush).not.toHaveBeenCalled()
        expect(dispatch).not.toHaveBeenCalled()
        expect(mockFetchNewPhoneNumbers).not.toHaveBeenCalled()
    })

    it('handles failed WhatsApp onboarding', () => {
        const toastSpy = jest.spyOn(toast, 'error')
        const { result } = renderHook(() =>
            useWhatsAppOnboardingRealtimeMessageHandler(),
        )

        result.current.handleWhatsAppOnboardingFailedRealtimeMessage({
            name: WHATSAPP_ONBOARDING_FAILED_EVENT,
            data: JSON.stringify({
                phone_number: '+123',
                error: {
                    message: 'OAuth failed',
                    code: 'oauth_error',
                },
            }),
        } as WhatsAppOnboardingRealtimeMessage)

        expect(mockHistoryPush).toHaveBeenCalledWith(
            '/app/settings/integrations/whatsapp/integrations',
        )
        expect(toastSpy).toHaveBeenCalledWith('OAuth failed (number: +123)', {
            duration: 10000,
        })
        expect(mockFetchIntegrations).not.toHaveBeenCalled()
        expect(mockFetchNewPhoneNumbers).not.toHaveBeenCalled()
    })

    it('uses the failed onboarding fallback message when the backend error message is missing', () => {
        const toastSpy = jest.spyOn(toast, 'error')
        const { result } = renderHook(() =>
            useWhatsAppOnboardingRealtimeMessageHandler(),
        )

        result.current.handleWhatsAppOnboardingFailedRealtimeMessage({
            name: WHATSAPP_ONBOARDING_FAILED_EVENT,
            data: JSON.stringify({
                phone_number: '+123',
                error: {
                    code: 'unknown',
                },
            }),
        } as WhatsAppOnboardingRealtimeMessage)

        expect(toastSpy).toHaveBeenCalledWith(
            'Failed to connect WhatsApp for number +123. Please try again or contact support.',
            { duration: 10000 },
        )
    })

    it('ignores malformed payloads and payloads missing the phone number', async () => {
        const { result } = renderHook(() =>
            useWhatsAppOnboardingRealtimeMessageHandler(),
        )

        await result.current.handleWhatsAppOnboardingSuccessRealtimeMessage({
            name: WHATSAPP_ONBOARDING_SUCCEEDED_EVENT,
            data: '{',
        } as WhatsAppOnboardingRealtimeMessage)
        await result.current.handleWhatsAppOnboardingSuccessRealtimeMessage({
            name: WHATSAPP_ONBOARDING_SUCCEEDED_EVENT,
            data: JSON.stringify({
                integration_id: 123,
            }),
        } as WhatsAppOnboardingRealtimeMessage)
        result.current.handleWhatsAppOnboardingFailedRealtimeMessage({
            name: WHATSAPP_ONBOARDING_FAILED_EVENT,
            data: JSON.stringify({
                error: {
                    message: 'OAuth failed',
                },
            }),
        } as WhatsAppOnboardingRealtimeMessage)

        expect(dispatch).not.toHaveBeenCalled()
        expect(mockFetchNewPhoneNumbers).not.toHaveBeenCalled()
    })
})
