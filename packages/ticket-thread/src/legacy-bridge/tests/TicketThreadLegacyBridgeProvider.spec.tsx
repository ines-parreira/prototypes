import type {
    CurrentTicketShoppingAssistantData,
    VoiceCallBridgeCallbacks,
} from '#legacy-bridge/types'
import { useTicketThreadLegacyBridge } from '#legacy-bridge/useTicketThreadLegacyBridge'
import { renderHook } from '#tests/render.utils'

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

describe('TicketThreadLegacyBridgeProvider', () => {
    it('voiceCallCallbacks is undefined in context when not provided', () => {
        const { result } = renderHook(() => useTicketThreadLegacyBridge(), {
            ...defaultProps,
        })

        expect(result.current.voiceCallCallbacks).toBeUndefined()
    })

    it('exposes safe default pending message callbacks when legacy overrides are omitted', () => {
        const { result } = renderHook(() => useTicketThreadLegacyBridge(), {
            ...defaultProps,
        })

        expect(
            result.current.legacyActions.undoTicketPendingMessage?.({
                id: 'pending-message',
            }),
        ).toBeUndefined()
        expect(
            result.current.legacyState.newMessage.canUndoTicketPendingMessage?.(
                {
                    id: 'pending-message',
                },
            ),
        ).toBe(false)
    })

    it('passes voiceCallCallbacks through to context when provided', () => {
        const callbacks: VoiceCallBridgeCallbacks = {
            renderMonitorCallButton: () => null,
        }

        const { result } = renderHook(() => useTicketThreadLegacyBridge(), {
            ...defaultProps,
            voiceCallCallbacks: callbacks,
        })

        expect(result.current.voiceCallCallbacks).toBe(callbacks)
    })
})
