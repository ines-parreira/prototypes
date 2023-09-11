import {Provider} from 'react-redux'
import React from 'react'
import {renderHook} from '@testing-library/react-hooks'
import {mockStore} from 'utils/testing'
import * as voiceCallQueries from 'models/voiceCall/queries'
import useTicketVoiceCalls from '../useTicketVoiceCalls'

const mockVoiceCallResult = {data: 'testResult'}

const useListTicketVoiceCallsSpy = jest.spyOn(
    voiceCallQueries,
    'useListTicketVoiceCalls'
)
const mockDispatchFn = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockDispatchFn)

const wrapper = ({children}: any) => (
    <Provider store={mockStore({} as any)}>{children}</Provider>
)

describe('useTicketVoiceCalls', () => {
    it('should return query result', () => {
        useListTicketVoiceCallsSpy.mockReturnValue(mockVoiceCallResult as any)
        const {result} = renderHook(() => useTicketVoiceCalls(), {wrapper})
        expect(result.current).toStrictEqual(mockVoiceCallResult)
    })

    it('updates query timestamp when data changes', () => {
        useListTicketVoiceCallsSpy.mockReturnValueOnce(
            mockVoiceCallResult as any
        )
        const {result, rerender} = renderHook(() => useTicketVoiceCalls(), {
            wrapper,
        })
        useListTicketVoiceCallsSpy.mockReturnValueOnce({data: 'newData'} as any)
        const dispatchCalls = mockDispatchFn.mock.calls.length
        rerender()
        expect(result.current).toStrictEqual({data: 'newData'})
        expect(mockDispatchFn.mock.calls.length).toBe(dispatchCalls + 1)
    })
})
