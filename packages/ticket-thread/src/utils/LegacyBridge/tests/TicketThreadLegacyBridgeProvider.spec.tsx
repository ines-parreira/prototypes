import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { TicketThreadLegacyBridgeProvider } from '../TicketThreadLegacyBridgeProvider'
import type {
    CurrentTicketShoppingAssistantData,
    VoiceCallBridgeCallbacks,
} from '../types'
import { useTicketThreadLegacyBridge } from '../useTicketThreadLegacyBridge'

const currentTicketShoppingAssistantData: CurrentTicketShoppingAssistantData = {
    influencedOrders: [],
    shopifyOrders: [],
    shopifyIntegrations: [],
}

const defaultProps = {
    currentTicketShoppingAssistantData,
    onInstagramCommentPrivateReply: () => undefined,
    onInstagramCommentHideComment: () => undefined,
    onFacebookCommentPrivateReply: () => undefined,
    onFacebookCommentHideComment: () => undefined,
    onFacebookCommentLike: () => undefined,
}

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
})

function wrapper({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <MemoryRouter>
                <Route path="/">
                    <TicketThreadLegacyBridgeProvider {...defaultProps}>
                        {children}
                    </TicketThreadLegacyBridgeProvider>
                </Route>
            </MemoryRouter>
        </QueryClientProvider>
    )
}

describe('TicketThreadLegacyBridgeProvider', () => {
    it('voiceCallCallbacks is undefined in context when not provided', () => {
        const { result } = renderHook(() => useTicketThreadLegacyBridge(), {
            wrapper,
        })

        expect(result.current.voiceCallCallbacks).toBeUndefined()
    })

    it('passes voiceCallCallbacks through to context when provided', () => {
        const callbacks: VoiceCallBridgeCallbacks = {
            renderMonitorCallButton: () => null,
        }

        const wrapperWithCallbacks = ({
            children,
        }: {
            children: React.ReactNode
        }) => (
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <Route path="/">
                        <TicketThreadLegacyBridgeProvider
                            {...defaultProps}
                            voiceCallCallbacks={callbacks}
                        >
                            {children}
                        </TicketThreadLegacyBridgeProvider>
                    </Route>
                </MemoryRouter>
            </QueryClientProvider>
        )

        const { result } = renderHook(() => useTicketThreadLegacyBridge(), {
            wrapper: wrapperWithCallbacks,
        })

        expect(result.current.voiceCallCallbacks).toBe(callbacks)
    })
})
