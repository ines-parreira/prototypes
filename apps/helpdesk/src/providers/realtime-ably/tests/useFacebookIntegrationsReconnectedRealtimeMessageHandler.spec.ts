import { renderHook } from '@repo/testing'

import { toast } from '@gorgias/axiom'

import { useAppDispatch } from 'hooks/useAppDispatch'
import { fetchIntegrations } from 'state/integrations/actions'

import { useFacebookIntegrationsReconnectedRealtimeMessageHandler } from '../useFacebookIntegrationsReconnectedRealtimeMessageHandler'

jest.mock('hooks/useAppDispatch')
jest.mock('state/integrations/actions', () => ({
    fetchIntegrations: jest.fn(() => ({ type: 'FETCH_INTEGRATIONS' })),
}))

const mockUseAppDispatch = useAppDispatch as jest.Mock
const mockFetchIntegrations = fetchIntegrations as jest.Mock

const dispatch = jest.fn()

type FacebookIntegrationsReconnectedRealtimeMessage = Parameters<
    ReturnType<
        typeof useFacebookIntegrationsReconnectedRealtimeMessageHandler
    >['handleFacebookIntegrationsReconnectedRealtimeMessage']
>[0]

describe('useFacebookIntegrationsReconnectedRealtimeMessageHandler', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAppDispatch.mockReturnValue(dispatch)
    })

    it('dispatches fetch integrations when the Ably event is received', () => {
        const { result } = renderHook(() =>
            useFacebookIntegrationsReconnectedRealtimeMessageHandler(),
        )

        result.current.handleFacebookIntegrationsReconnectedRealtimeMessage({
            name: 'facebook-integrations.reconnected',
            data: JSON.stringify({
                total: 1,
            }),
        } as FacebookIntegrationsReconnectedRealtimeMessage)

        expect(mockFetchIntegrations).toHaveBeenCalled()
        expect(dispatch).toHaveBeenCalledWith({ type: 'FETCH_INTEGRATIONS' })
    })

    it('shows a singular success toast when one Facebook page is reconnected', () => {
        const spy = jest.spyOn(toast, 'success')
        const { result } = renderHook(() =>
            useFacebookIntegrationsReconnectedRealtimeMessageHandler(),
        )

        result.current.handleFacebookIntegrationsReconnectedRealtimeMessage({
            name: 'facebook-integrations.reconnected',
            data: {
                total: 1,
            },
        } as FacebookIntegrationsReconnectedRealtimeMessage)

        expect(spy).toHaveBeenCalledWith(
            'One Facebook page has been reconnected.',
        )
    })

    it('shows a plural success toast when multiple Facebook pages are reconnected', () => {
        const spy = jest.spyOn(toast, 'success')
        const { result } = renderHook(() =>
            useFacebookIntegrationsReconnectedRealtimeMessageHandler(),
        )

        result.current.handleFacebookIntegrationsReconnectedRealtimeMessage({
            name: 'facebook-integrations.reconnected',
            data: {
                total: 2,
            },
        } as FacebookIntegrationsReconnectedRealtimeMessage)

        expect(spy).toHaveBeenCalledWith(
            '2 Facebook pages have been reconnected.',
        )
    })

    it('ignores unrelated events', () => {
        const { result } = renderHook(() =>
            useFacebookIntegrationsReconnectedRealtimeMessageHandler(),
        )

        result.current.handleFacebookIntegrationsReconnectedRealtimeMessage({
            name: 'email.integration-verified',
            data: JSON.stringify({
                integration_id: 1,
            }),
        } as FacebookIntegrationsReconnectedRealtimeMessage)

        expect(mockFetchIntegrations).not.toHaveBeenCalled()
        expect(dispatch).not.toHaveBeenCalled()
    })

    it('ignores malformed events', () => {
        const { result } = renderHook(() =>
            useFacebookIntegrationsReconnectedRealtimeMessageHandler(),
        )

        result.current.handleFacebookIntegrationsReconnectedRealtimeMessage({
            name: 'facebook-integrations.reconnected',
            data: '{',
        } as FacebookIntegrationsReconnectedRealtimeMessage)

        expect(mockFetchIntegrations).not.toHaveBeenCalled()
        expect(dispatch).not.toHaveBeenCalled()
    })

    it('ignores reconnect events without a total', () => {
        const { result } = renderHook(() =>
            useFacebookIntegrationsReconnectedRealtimeMessageHandler(),
        )

        result.current.handleFacebookIntegrationsReconnectedRealtimeMessage({
            name: 'facebook-integrations.reconnected',
            data: {},
        } as FacebookIntegrationsReconnectedRealtimeMessage)

        expect(mockFetchIntegrations).not.toHaveBeenCalled()
        expect(dispatch).not.toHaveBeenCalled()
    })
})
