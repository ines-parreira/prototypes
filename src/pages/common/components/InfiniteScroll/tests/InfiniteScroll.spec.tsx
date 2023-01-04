import React, {ComponentProps} from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'

import InfiniteScroll from '../InfiniteScroll'

describe('InfiniteScroll component', () => {
    const originalClientHeight =
        Object.getOwnPropertyDescriptor(
            HTMLElement.prototype,
            'clientHeight'
        ) || 0

    const originalScrollHeight =
        Object.getOwnPropertyDescriptor(
            HTMLElement.prototype,
            'scrollHeight'
        ) || 0

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

    beforeEach(() => {
        jest.clearAllMocks()
    })

    const minProps: ComponentProps<typeof InfiniteScroll> = {
        onLoad: jest.fn(),
        shouldLoadMore: true,
        children: <div>Pizza Pepperoni</div>,
    }

    it('should display infinite scroll with children', () => {
        const {container} = render(<InfiniteScroll {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should trigger load on scroll to bottom', async () => {
        const load = jest.fn()
        const {container} = render(
            <InfiniteScroll
                {...minProps}
                onLoad={() => {
                    load()
                    return Promise.resolve()
                }}
            />
        )

        fireEvent.scroll(container.firstChild!, {target: {scrollTop: 200}})

        await waitFor(() => expect(load).toBeCalled())
    })

    it('should not trigger load when not scrolled to bottom', async () => {
        const load = jest.fn()
        const {container} = render(
            <InfiniteScroll
                {...minProps}
                onLoad={() => {
                    load()
                    return Promise.resolve()
                }}
            />
        )

        fireEvent.scroll(container.firstChild!, {target: {scrollTop: 10}})
        await waitFor(() => expect(load).not.toBeCalled())
    })

    it('should trigger load on scroll to bottom with different threshold', async () => {
        const load = jest.fn()
        const {container} = render(
            <InfiniteScroll
                {...minProps}
                threshold={1}
                onLoad={() => {
                    load()
                    return Promise.resolve()
                }}
            />
        )

        fireEvent.scroll(container.firstChild!, {
            target: {scrollTop: 100},
        })
        await waitFor(() => expect(load).toBeCalled())
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
        await waitFor(() => expect(load).not.toBeCalled())
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
})
