import React from 'react'
import {act, render} from '@testing-library/react'

import {createContextConsumer} from '../../../../../utils/testing'
import SynchronizedScrollTopContext from '../SynchronizedScrollTopContext'
import SynchronizedScrollTopProvider from '../SynchronizedScrollTopProvider'

const SynchronizedScrollTopConsumer = createContextConsumer(
    SynchronizedScrollTopContext
)

describe('<SynchronizedScrollTopProvider />', () => {
    let windowAddEventListenerSpy: jest.SpyInstance

    beforeEach(() => {
        jest.clearAllMocks()
        jest.useFakeTimers()
        windowAddEventListenerSpy = jest.spyOn(window, 'addEventListener')
    })

    afterEach(() => {
        jest.useRealTimers()
        windowAddEventListenerSpy.mockRestore()
    })

    it('should return default values on first render', () => {
        render(
            <SynchronizedScrollTopProvider>
                <SynchronizedScrollTopConsumer />
            </SynchronizedScrollTopProvider>
        )

        expect(
            SynchronizedScrollTopConsumer.getLastContextValue()
        ).toMatchObject({
            scrollTop: 0,
            scrollHeight: 0,
        })
    })

    it('should update the scrollHeight on setScrollHeight call', () => {
        render(
            <SynchronizedScrollTopProvider>
                <SynchronizedScrollTopConsumer />
            </SynchronizedScrollTopProvider>
        )

        act(() => {
            SynchronizedScrollTopConsumer.getLastContextValue()?.setScrollHeight(
                20
            )
        })

        expect(
            SynchronizedScrollTopConsumer.getLastContextValue()
        ).toMatchObject({
            scrollHeight: 20,
        })
    })

    it('should update the scrollTop on setScrollTop call', () => {
        render(
            <SynchronizedScrollTopProvider>
                <SynchronizedScrollTopConsumer />
            </SynchronizedScrollTopProvider>
        )

        act(() => {
            SynchronizedScrollTopConsumer.getLastContextValue()?.setScrollTop(
                50
            )
        })

        expect(
            SynchronizedScrollTopConsumer.getLastContextValue()
        ).toMatchObject({
            scrollTop: 50,
        })
    })

    it('should reset scrollTop and scrollHeight on window load', () => {
        render(
            <SynchronizedScrollTopProvider>
                <SynchronizedScrollTopConsumer />
            </SynchronizedScrollTopProvider>
        )
        act(() => {
            SynchronizedScrollTopConsumer.getLastContextValue()?.setScrollHeight(
                20
            )
            SynchronizedScrollTopConsumer.getLastContextValue()?.setScrollTop(
                50
            )
        })
        act(() => {
            const load = (windowAddEventListenerSpy.mock.calls as [
                [string, () => void]
            ]).find((call) => call[0] === 'load')![1]
            load()
        })

        expect(
            SynchronizedScrollTopConsumer.getLastContextValue()
        ).toMatchObject({
            scrollTop: 0,
            scrollHeight: 0,
        })
    })

    it('should debounce reset scrollTop and scrollHeight on window width change', () => {
        global.innerWidth = 300
        const {rerender} = render(
            <SynchronizedScrollTopProvider>
                <SynchronizedScrollTopConsumer />
            </SynchronizedScrollTopProvider>
        )
        act(() => {
            SynchronizedScrollTopConsumer.getLastContextValue()?.setScrollHeight(
                20
            )
            SynchronizedScrollTopConsumer.getLastContextValue()?.setScrollTop(
                50
            )
        })
        global.innerWidth = 400
        rerender(
            <SynchronizedScrollTopProvider>
                <SynchronizedScrollTopConsumer />
            </SynchronizedScrollTopProvider>
        )
        rerender(
            <SynchronizedScrollTopProvider>
                <SynchronizedScrollTopConsumer />
            </SynchronizedScrollTopProvider>
        )
        expect(
            SynchronizedScrollTopConsumer.getLastContextValue()
        ).not.toMatchObject({
            scrollTop: 0,
            scrollHeight: 0,
        })

        act(() => {
            jest.runAllTimers()
        })
        expect(
            SynchronizedScrollTopConsumer.getLastContextValue()
        ).toMatchObject({
            scrollTop: 0,
            scrollHeight: 0,
        })
    })
})
