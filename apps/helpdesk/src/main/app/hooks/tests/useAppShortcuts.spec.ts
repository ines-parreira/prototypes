import { renderHook } from '@repo/testing'

import useAppDispatch from 'hooks/useAppDispatch'
import useShortcuts from 'hooks/useShortcuts'
import pendingMessageManager from 'services/pendingMessageManager/pendingMessageManager'

import useAppShortcuts from '../useAppShortcuts'

jest.mock('hooks/useAppDispatch', () => jest.fn())
jest.mock('hooks/useShortcuts', () => jest.fn())
jest.mock('services/pendingMessageManager/pendingMessageManager', () => ({
    undoMessage: jest.fn(),
}))
jest.mock('state/views/actions', () => ({
    goToActiveView: jest.fn(),
}))

const useAppDispatchMock = useAppDispatch as jest.Mock
const useShortcutsMock = useShortcuts as jest.Mock

describe('useAppShortcuts', () => {
    let dispatch: jest.Mock

    beforeEach(() => {
        jest.restoreAllMocks()

        dispatch = jest.fn()
        useAppDispatchMock.mockReturnValue(dispatch)
    })

    it('should register app shortcuts', () => {
        renderHook(() => useAppShortcuts())

        expect(useShortcuts).toHaveBeenCalledWith('App', {
            GO_VIEW: {
                action: expect.any(Function),
            },
            UNDO_MESSAGE: {
                action: expect.any(Function),
            },
        })
    })

    it('should go to a view', () => {
        renderHook(() => useAppShortcuts())

        const { action: goView } = (
            useShortcutsMock.mock.calls as [
                [string, { GO_VIEW: { action: (e: Event) => void } }],
            ]
        )[0][1].GO_VIEW

        const preventDefault = jest.fn()
        goView({ preventDefault } as unknown as Event)

        expect(preventDefault).toHaveBeenCalledWith()
        expect(dispatch).toHaveBeenCalled()
    })

    it('should undo a message', () => {
        renderHook(() => useAppShortcuts())

        const { action: undoMessage } = (
            useShortcutsMock.mock.calls as [
                [string, { UNDO_MESSAGE: { action: () => void } }],
            ]
        )[0][1].UNDO_MESSAGE

        undoMessage()
        expect(pendingMessageManager.undoMessage).toHaveBeenCalledWith()
    })
})
