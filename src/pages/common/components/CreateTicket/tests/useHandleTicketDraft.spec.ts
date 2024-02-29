import {renderHook} from '@testing-library/react-hooks/dom'
import {fromJS} from 'immutable'
import {waitFor} from '@testing-library/react'

import useAppSelector from 'hooks/useAppSelector'
import {user} from 'fixtures/users'
import LocalForageManager from 'services/localForageManager/localForageManager'
import {logEvent, SegmentEvent} from 'common/segment'

import useHandleTicketDraft from '../useHandleTicketDraft'

jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = useAppSelector as jest.Mock

const mockSetItem = jest.fn()
const mockGetItem = jest.fn()
const mockGetTableObject = {
    getItem: mockGetItem,
    setItem: mockSetItem,
    ready: jest.fn().mockResolvedValue(true),
} as unknown as LocalForage

jest.spyOn(LocalForageManager, 'getTable').mockReturnValue(mockGetTableObject)

const mockHistoryPush = jest.fn()

jest.mock(
    'react-router-dom',
    () =>
        ({
            ...jest.requireActual('react-router-dom'),
            useHistory: () => ({
                push: mockHistoryPush,
            }),
        } as Record<string, unknown>)
)

jest.mock('common/segment')
const logEventMock = logEvent as jest.Mock

describe('useHandleTicketDraft', () => {
    beforeEach(() => {
        useAppSelectorMock.mockReturnValue(fromJS(user))
    })

    it('should return false by default', () => {
        const {result} = renderHook(() => useHandleTicketDraft())
        expect(result.current.hasDraft).toBe(false)
    })

    it('should return true when there is a draft', async () => {
        jest.spyOn(LocalForageManager, 'getTable').mockReturnValueOnce({
            ...mockGetTableObject,
            getItem: jest.fn().mockResolvedValue({subject: 'title'}),
        })

        const {result} = renderHook(() => useHandleTicketDraft())

        await waitFor(() => {
            expect(result.current.hasDraft).toBe(true)
        })
    })

    it('should handle draft resuming', () => {
        const {result} = renderHook(() => useHandleTicketDraft())
        result.current.onResumeDraft()

        expect(mockHistoryPush).toHaveBeenCalledWith('/app/ticket/new')
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.DraftTicket,
            expect.objectContaining({
                type: 'resume',
                user_id: user.id,
            })
        )
    })

    it('should handle draft discarding', async () => {
        const mockClear = jest.fn().mockResolvedValue(true)
        jest.spyOn(LocalForageManager, 'getTable').mockReturnValueOnce({
            ...mockGetTableObject,
            clear: mockClear,
        })

        const {result} = renderHook(() => useHandleTicketDraft())
        await result.current.onDiscardDraft()

        await waitFor(() => {
            expect(mockClear).toHaveBeenCalled()
            expect(mockHistoryPush).toHaveBeenCalledWith('/app/ticket/new')
        })

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.DraftTicket,
            expect.objectContaining({
                type: 'discard',
                user_id: user.id,
            })
        )
    })

    it('should setup localForage subscription', async () => {
        const observeTableSpy = jest.spyOn(LocalForageManager, 'observeTable')
        renderHook(() => useHandleTicketDraft())

        await waitFor(() => {
            expect(observeTableSpy).toHaveBeenCalled()
        })
    })
})
