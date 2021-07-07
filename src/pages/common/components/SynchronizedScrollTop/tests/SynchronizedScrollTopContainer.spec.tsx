import React, {useRef} from 'react'
import {render} from '@testing-library/react'

import SynchronizedScrollTopContainer from '../SynchronizedScrollTopContainer'
import SynchronizedScrollTopContext, {
    SynchronizedScrollTopValue,
} from '../SynchronizedScrollTopContext'

const useRefMock = useRef as jest.MockedFunction<typeof useRef>
const containerRefMock: {
    current: {scrollHeight?: number; scrollTop?: number} | null
} = {current: null}

jest.mock('react', () => {
    const originReact = jest.requireActual('react')
    return {
        ...originReact,
        useRef: jest.fn(),
    } as unknown
})

describe('<SynchronizedScrollTopContainer />', () => {
    const setScrollTopMock = jest.fn() as jest.MockedFunction<
        SynchronizedScrollTopValue['setScrollTop']
    >
    const setScrollHeightMock = jest.fn() as jest.MockedFunction<
        SynchronizedScrollTopValue['setScrollHeight']
    >
    const defaultSynchronizedScrollTopValue: SynchronizedScrollTopValue = {
        scrollTop: 0,
        setScrollTop: setScrollTopMock,
        scrollHeight: 0,
        setScrollHeight: setScrollHeightMock,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        useRefMock.mockReturnValue(containerRefMock)
    })

    it('should render the component with default synchronized scroll top values', () => {
        const {container} = render(
            <SynchronizedScrollTopContext.Provider
                value={defaultSynchronizedScrollTopValue}
            >
                <SynchronizedScrollTopContainer height={300}>
                    <div>Foo</div>
                </SynchronizedScrollTopContainer>
            </SynchronizedScrollTopContext.Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the component with scrollHeight and container height set', () => {
        const {container} = render(
            <SynchronizedScrollTopContext.Provider
                value={{
                    ...defaultSynchronizedScrollTopValue,
                    scrollHeight: 500,
                }}
            >
                <SynchronizedScrollTopContainer height={300}>
                    <div>Foo</div>
                </SynchronizedScrollTopContainer>
            </SynchronizedScrollTopContext.Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the component with scrollTop set', () => {
        const {rerender} = render(
            <SynchronizedScrollTopContext.Provider
                value={{
                    ...defaultSynchronizedScrollTopValue,
                    scrollTop: 20,
                }}
            >
                <SynchronizedScrollTopContainer height={300}>
                    <div>Foo</div>
                </SynchronizedScrollTopContainer>
            </SynchronizedScrollTopContext.Provider>
        )
        rerender(
            <SynchronizedScrollTopContext.Provider
                value={{
                    ...defaultSynchronizedScrollTopValue,
                    scrollTop: 20,
                }}
            >
                <SynchronizedScrollTopContainer height={300}>
                    <div>Foo</div>
                </SynchronizedScrollTopContainer>
            </SynchronizedScrollTopContext.Provider>
        )

        expect(containerRefMock.current?.scrollTop).toBe(20)
    })

    it('should render the component with no scroll bar', () => {
        const {container} = render(
            <SynchronizedScrollTopContext.Provider
                value={{
                    ...defaultSynchronizedScrollTopValue,
                    scrollTop: 20,
                    scrollHeight: 500,
                }}
            >
                <SynchronizedScrollTopContainer height={300} hideScrollbar>
                    <div>Foo</div>
                </SynchronizedScrollTopContainer>
            </SynchronizedScrollTopContext.Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not call setScrollHeight on mount when scrollHeight is a positive number', () => {
        render(
            <SynchronizedScrollTopContext.Provider
                value={{...defaultSynchronizedScrollTopValue, scrollHeight: 30}}
            >
                <SynchronizedScrollTopContainer height={300}>
                    <div>Foo</div>
                </SynchronizedScrollTopContainer>
            </SynchronizedScrollTopContext.Provider>
        )
        expect(setScrollHeightMock).not.toHaveBeenCalled()
    })

    it('should call setScrollHeight with a container scrollHeight on mount when container scrollHeight is higher than the provider scrollHeight', () => {
        render(
            <SynchronizedScrollTopContext.Provider
                value={{...defaultSynchronizedScrollTopValue, scrollHeight: 0}}
            >
                <SynchronizedScrollTopContainer height={300}>
                    <div>Foo</div>
                </SynchronizedScrollTopContainer>
            </SynchronizedScrollTopContext.Provider>
        )
        expect(setScrollHeightMock).toHaveBeenCalled()

        containerRefMock.current = {scrollHeight: 200}
        const lastCall = setScrollHeightMock.mock.calls.slice(-1, 1)[0][0] as (
            scrollHeight: number
        ) => number
        expect(lastCall(100)).toBe(200)
    })

    it('should call setScrollHeight with a provider scrollHeight on mount when container scrollHeight is lower than the provider scrollHeight', () => {
        render(
            <SynchronizedScrollTopContext.Provider
                value={{...defaultSynchronizedScrollTopValue, scrollHeight: 0}}
            >
                <SynchronizedScrollTopContainer height={300}>
                    <div>Foo</div>
                </SynchronizedScrollTopContainer>
            </SynchronizedScrollTopContext.Provider>
        )
        expect(setScrollHeightMock).toHaveBeenCalled()

        containerRefMock.current = {scrollHeight: 100}
        const lastCall = setScrollHeightMock.mock.calls.slice(-1, 1)[0][0] as (
            scrollHeight: number
        ) => number
        expect(lastCall(200)).toBe(200)
    })
})
