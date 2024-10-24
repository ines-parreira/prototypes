import {fireEvent, render, waitFor} from '@testing-library/react'
import React, {ComponentProps} from 'react'

import Spinner from 'pages/common/components/Spinner'

import InfiniteScroll from '../InfiniteScroll'

jest.mock(
    'pages/common/components/Spinner',
    () =>
        ({size, width}: ComponentProps<typeof Spinner>) => (
            <div>
                SpinnerMock
                <div>size-{size}</div>
                <div>width-{width}</div>
            </div>
        )
)

describe('<InfiniteScroll />', () => {
    const originalClientHeight = Object.getOwnPropertyDescriptor(
        Element.prototype,
        'clientHeight'
    ) || {
        configurable: true,
        value: 0,
    }

    const originalScrollHeight = Object.getOwnPropertyDescriptor(
        Element.prototype,
        'scrollHeight'
    ) || {
        configurable: true,
        value: 0,
    }

    beforeAll(() => {
        Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
            configurable: true,
            value: 100,
        })
        Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
            configurable: true,
            value: 200,
        })
    })

    afterAll(() => {
        Object.defineProperty(
            HTMLElement.prototype,
            'clientHeight',
            originalClientHeight
        )
        Object.defineProperty(
            HTMLElement.prototype,
            'scrollHeight',
            originalScrollHeight
        )
    })

    const mockChildren = 'Pizza Pepperoni'
    const minProps: ComponentProps<typeof InfiniteScroll> = {
        onLoad: jest.fn(),
        shouldLoadMore: true,
        children: <div>{mockChildren}</div>,
    }

    it('should display children', () => {
        const {getByText} = render(<InfiniteScroll {...minProps} />)

        expect(getByText(mockChildren)).toBeInTheDocument()
    })

    it('should trigger load on scroll to bottom', async () => {
        const {container} = render(<InfiniteScroll {...minProps} />)

        fireEvent.scroll(container.firstChild!, {target: {scrollTop: 200}})

        await waitFor(() => expect(minProps.onLoad).toBeCalled())
    })

    it('should not trigger load when not scrolled to bottom', async () => {
        const {container} = render(<InfiniteScroll {...minProps} />)

        fireEvent.scroll(container.firstChild!, {target: {scrollTop: 10}})
        await waitFor(() => expect(minProps.onLoad).not.toBeCalled())
    })

    it('should trigger load on scroll to bottom with different threshold', async () => {
        const {container} = render(
            <InfiniteScroll {...minProps} threshold={1} />
        )

        fireEvent.scroll(container.firstChild!, {
            target: {scrollTop: 100},
        })
        await waitFor(() => expect(minProps.onLoad).toBeCalled())
    })

    it('should not trigger load with shouldLoadMore=false', async () => {
        const load = jest.fn()
        const {container} = render(
            <InfiniteScroll
                {...minProps}
                shouldLoadMore={false}
                onLoad={() => {
                    load()
                    return Promise.resolve()
                }}
            />
        )

        fireEvent.scroll(container.firstChild!, {target: {scrollTop: 50}})
        await waitFor(() => expect(minProps.onLoad).not.toBeCalled())
    })

    it('should call onLoad when is able to load more', async () => {
        const props = {...minProps, threshold: 100}
        const {rerender} = render(<InfiniteScroll {...props} />)

        await waitFor(() => expect(props.onLoad).toHaveBeenCalledTimes(1))
        rerender(<InfiniteScroll {...props} shouldLoadMore={false} />)
        rerender(<InfiniteScroll {...props} />)
        await waitFor(() => expect(props.onLoad).toHaveBeenCalledTimes(2))
    })

    it('should call onLoad when onLoad is updated and it is able to load more', async () => {
        const first = jest.fn()
        const second = jest.fn()
        const props = {...minProps, threshold: 100}
        const {rerender} = render(<InfiniteScroll {...props} onLoad={first} />)

        await waitFor(() => expect(first).toHaveBeenCalledTimes(1))
        rerender(<InfiniteScroll {...props} onLoad={second} />)
        await waitFor(() => expect(second).toHaveBeenCalledTimes(1))
    })

    it('should use external isLoading prop', async () => {
        const {getByText} = render(<InfiniteScroll {...minProps} isLoading />)

        await waitFor(() => expect(minProps.onLoad).not.toHaveBeenCalled())
        expect(getByText('SpinnerMock')).toBeInTheDocument()
        expect(getByText(/size-small/)).toBeInTheDocument()
    })

    it('should use specified Spinner width', () => {
        const loaderSize = 10
        const {getByText} = render(
            <InfiniteScroll {...minProps} isLoading loaderSize={loaderSize} />
        )

        expect(getByText('SpinnerMock')).toBeInTheDocument()
        expect(getByText(/width-10/)).toBeInTheDocument()
    })
})
