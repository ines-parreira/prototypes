import { renderHook } from '@repo/testing'

import useAppDispatch from 'hooks/useAppDispatch'
import * as widgetActions from 'state/widgets/actions'
import { WidgetEnvironment } from 'state/widgets/types'

import useSyncWidgetEditSession from '../useSyncWidgetEditSession'

jest.mock('hooks/useAppDispatch', () => jest.fn())
jest.mock('state/widgets/actions', () => ({
    startEditionMode: jest.fn(),
    stopEditionMode: jest.fn(),
}))

const useAppDispatchMock = useAppDispatch as jest.Mock
const mockDispatch = jest.fn()

beforeEach(() => {
    jest.clearAllMocks()
    useAppDispatchMock.mockReturnValue(mockDispatch)
})

describe('useSyncWidgetEditSession', () => {
    it('should not dispatch when both isEditSessionRequested and isEditSessionActive are false', () => {
        renderHook(() =>
            useSyncWidgetEditSession({
                context: WidgetEnvironment.Ticket,
                isEditSessionActive: false,
                isEditSessionRequested: false,
            }),
        )

        expect(mockDispatch).not.toHaveBeenCalled()
    })

    it('should not dispatch when both isEditSessionRequested and isEditSessionActive are true', () => {
        renderHook(() =>
            useSyncWidgetEditSession({
                context: WidgetEnvironment.Ticket,
                isEditSessionActive: true,
                isEditSessionRequested: true,
            }),
        )

        expect(mockDispatch).not.toHaveBeenCalled()
    })

    it('should dispatch startEditionMode when requested is true and active is false', () => {
        const startAction = { type: 'START_EDITION_MODE' }
        jest.mocked(widgetActions.startEditionMode).mockReturnValue(
            startAction as any,
        )

        renderHook(() =>
            useSyncWidgetEditSession({
                context: WidgetEnvironment.Ticket,
                isEditSessionActive: false,
                isEditSessionRequested: true,
            }),
        )

        expect(widgetActions.startEditionMode).toHaveBeenCalledWith(
            WidgetEnvironment.Ticket,
        )
        expect(mockDispatch).toHaveBeenCalledWith(startAction)
    })

    it('should dispatch stopEditionMode when requested is false and active is true', () => {
        const stopAction = { type: 'STOP_EDITION_MODE' }
        jest.mocked(widgetActions.stopEditionMode).mockReturnValue(
            stopAction as any,
        )

        renderHook(() =>
            useSyncWidgetEditSession({
                context: WidgetEnvironment.Ticket,
                isEditSessionActive: true,
                isEditSessionRequested: false,
            }),
        )

        expect(widgetActions.stopEditionMode).toHaveBeenCalled()
        expect(mockDispatch).toHaveBeenCalledWith(stopAction)
    })
})
