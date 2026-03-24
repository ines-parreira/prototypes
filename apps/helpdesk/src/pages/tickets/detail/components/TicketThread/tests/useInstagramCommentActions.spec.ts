import { act, renderHook } from '@testing-library/react'

import { queryKeys } from '@gorgias/helpdesk-queries'

import { appQueryClient } from 'api/queryClient'
import useAppDispatch from 'hooks/useAppDispatch'
import * as infobarActions from 'state/infobar/actions'

import { useInstagramCommentActions } from '../useInstagramCommentActions'

jest.mock('hooks/useAppDispatch', () => jest.fn())
jest.mock('api/queryClient', () => ({
    appQueryClient: { invalidateQueries: jest.fn() },
}))
jest.mock('state/infobar/actions', () => ({
    executeAction: jest.fn(),
}))

const mockDispatch = jest.fn()
const mockPrivateReplyData = {
    integrationId: 1,
    messageId: 'msg-1',
    ticketMessageId: 123,
    ticketId: 42,
    senderId: 456,
    commentMessage: 'Hello',
    source: {},
    sender: {},
    meta: {},
    messageCreatedDatetime: '2024-01-01T00:00:00Z',
}

beforeEach(() => {
    jest.mocked(useAppDispatch).mockReturnValue(mockDispatch)
    mockDispatch.mockClear()
    jest.mocked(infobarActions.executeAction).mockClear()
    jest.mocked(appQueryClient.invalidateQueries).mockClear()
})

describe('useInstagramCommentActions', () => {
    it('handlePrivateReply sets privateReplyData', () => {
        const { result } = renderHook(() => useInstagramCommentActions())

        act(() => {
            result.current.handlePrivateReply(mockPrivateReplyData)
        })

        expect(result.current.privateReplyData).toEqual(mockPrivateReplyData)
    })

    it('handlePrivateReplyToggle clears privateReplyData', () => {
        const { result } = renderHook(() => useInstagramCommentActions())

        act(() => {
            result.current.handlePrivateReply(mockPrivateReplyData)
        })
        act(() => {
            result.current.handlePrivateReplyToggle()
        })

        expect(result.current.privateReplyData).toBeNull()
    })

    it('handleHideComment does not dispatch when integrationId is null', () => {
        const { result } = renderHook(() => useInstagramCommentActions())

        act(() => {
            result.current.handleHideComment({
                integrationId: null,
                messageId: 'msg-1',
                ticketId: 42,
                shouldHide: true,
            })
        })

        expect(mockDispatch).not.toHaveBeenCalled()
    })

    it('handleHideComment dispatches instagramHideComment when shouldHide is true', () => {
        const { result } = renderHook(() => useInstagramCommentActions())

        act(() => {
            result.current.handleHideComment({
                integrationId: 1,
                messageId: 'msg-1',
                ticketId: 42,
                shouldHide: true,
            })
        })

        expect(infobarActions.executeAction).toHaveBeenCalledWith(
            expect.objectContaining({
                actionName: 'instagramHideComment',
                integrationId: 1,
                payload: { comment_id: 'msg-1' },
            }),
        )
        expect(mockDispatch).toHaveBeenCalled()
    })

    it('handleHideComment dispatches instagramUnhideComment when shouldHide is false', () => {
        const { result } = renderHook(() => useInstagramCommentActions())

        act(() => {
            result.current.handleHideComment({
                integrationId: 1,
                messageId: 'msg-1',
                ticketId: 42,
                shouldHide: false,
            })
        })

        expect(infobarActions.executeAction).toHaveBeenCalledWith(
            expect.objectContaining({
                actionName: 'instagramUnhideComment',
            }),
        )
    })

    it('handleHideComment callback invalidates the correct ticket messages query', () => {
        const { result } = renderHook(() => useInstagramCommentActions())

        act(() => {
            result.current.handleHideComment({
                integrationId: 1,
                messageId: 'msg-1',
                ticketId: 42,
                shouldHide: true,
            })
        })

        const { callback } = jest.mocked(infobarActions.executeAction).mock
            .calls[0][0] as { callback: () => void }
        callback()

        expect(appQueryClient.invalidateQueries).toHaveBeenCalledWith({
            queryKey: queryKeys.ticketMessages.listMessages({
                ticket_id: 42,
            }),
        })
    })

    it('handleHideComment passes undefined comment_id when messageId is null', () => {
        const { result } = renderHook(() => useInstagramCommentActions())

        act(() => {
            result.current.handleHideComment({
                integrationId: 1,
                messageId: null,
                ticketId: 42,
                shouldHide: true,
            })
        })

        expect(infobarActions.executeAction).toHaveBeenCalledWith(
            expect.objectContaining({
                payload: { comment_id: undefined },
            }),
        )
    })
})
