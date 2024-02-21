import React, {MutableRefObject, forwardRef} from 'react'
import {renderHook, act} from '@testing-library/react-hooks/dom'
import noop from 'lodash/noop'
import {render} from '@testing-library/react'

import useHasWrapped from '../useHasWrapped'

type MockedResizeObserver = (listener: any) => any
type ResizeListener = (rect: any) => void

const resizeObserverMethods = {
    observe: noop,
    disconnect: noop,
}

const HookWrapper = forwardRef<HTMLDivElement, Record<string, unknown>>(
    (props, ref) => <div ref={ref} />
)

describe('useHasWrapped', () => {
    it('should return default state', () => {
        const {result} = renderHook(useHasWrapped)

        act(() => {
            const [ref] = result.current
            render(
                <HookWrapper ref={ref as MutableRefObject<HTMLDivElement>} />
            )
        })

        expect(result.current[1]).toBeFalsy()
    })

    it('should synchronously set up ResizeObserver listener', () => {
        const spy = jest.spyOn(window, 'ResizeObserver')

        const {result} = renderHook(useHasWrapped)

        act(() => {
            const [ref] = result.current
            render(
                <HookWrapper ref={ref as MutableRefObject<HTMLDivElement>} />
            )
        })

        expect(typeof spy.mock.lastCall?.[0]).toBe('function')
    })

    it('should track the children of a DOM element', () => {
        let resizeListener: ResizeListener
        jest.spyOn(window, 'ResizeObserver').mockImplementation(((listener) => {
            resizeListener = listener
            return resizeObserverMethods
        }) as MockedResizeObserver)

        const {result} = renderHook(useHasWrapped)

        act(() => {
            const [ref] = result.current
            render(
                <HookWrapper ref={ref as MutableRefObject<HTMLDivElement>} />
            )
        })

        const target = {
            children: [
                {
                    getBoundingClientRect: () => ({
                        top: 10,
                    }),
                },
                {
                    getBoundingClientRect: () => ({
                        top: 20,
                    }),
                },
            ],
        }

        act(() => {
            resizeListener([{target}])
        })

        expect(result.current[1]).toBeTruthy()
    })

    it('should track multiple updates', () => {
        let resizeListener: ResizeListener
        jest.spyOn(window, 'ResizeObserver').mockImplementation(((listener) => {
            resizeListener = listener
            return resizeObserverMethods
        }) as MockedResizeObserver)

        const {result} = renderHook(useHasWrapped)

        act(() => {
            const [ref] = result.current
            render(
                <HookWrapper ref={ref as MutableRefObject<HTMLDivElement>} />
            )
        })

        const target = {
            children: [
                {
                    getBoundingClientRect: () => ({
                        top: 10,
                    }),
                },
                {
                    getBoundingClientRect: () => ({
                        top: 10,
                    }),
                },
            ],
        }

        act(() => {
            resizeListener([{target}])
        })

        expect(result.current[1]).toBeFalsy()

        const updatedTarget = {
            children: [
                {
                    getBoundingClientRect: () => ({
                        top: 10,
                    }),
                },
                {
                    getBoundingClientRect: () => ({
                        top: 20,
                    }),
                },
            ],
        }

        act(() => {
            resizeListener([{target: updatedTarget}])
        })

        expect(result.current[1]).toBeTruthy()
    })

    //unskip this when this is solved https://github.com/testing-library/react-hooks-testing-library/issues/847
    it.skip('should call .disconnect() on ResizeObserver when component unmounts', () => {
        const disconnect = jest.fn()
        jest.spyOn(window, 'ResizeObserver').mockImplementation((() => {
            return {observe: noop, disconnect}
        }) as MockedResizeObserver)

        const hook = renderHook(useHasWrapped)

        act(() => {
            const [ref] = hook.result.current
            render(
                <HookWrapper ref={ref as MutableRefObject<HTMLDivElement>} />
            )

            expect(disconnect).toHaveBeenCalledTimes(0)
            hook.unmount()
        })

        expect(disconnect).toHaveBeenCalledTimes(1)
    })
})
