import React from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'

import InfiniteScroll from '../InfiniteScroll.tsx'

describe('InfiniteScroll component', () => {
    const originalClientHeight = Object.getOwnPropertyDescriptor(
        HTMLElement.prototype,
        'clientHeight'
    )

    const originalScrollHeight = Object.getOwnPropertyDescriptor(
        HTMLElement.prototype,
        'scrollHeight'
    )

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

    it('should display infinite scroll with children', () => {
        const {container} = render(
            <InfiniteScroll>
                <div>Pizza Pepperoni</div>
            </InfiniteScroll>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should trigger load on scroll to bottom', () => {
        const load = jest.fn()
        const {container} = render(
            <InfiniteScroll
                onLoad={() => {
                    load()
                    return Promise.resolve()
                }}
            />
        )

        fireEvent.scroll(container.firstChild, {target: {scrollTop: 200}})

        expect(load).toBeCalled()
    })

    it('should not trigger load when not scrolled to bottom', () => {
        const load = jest.fn()
        const {container} = render(
            <InfiniteScroll
                onLoad={() => {
                    load()
                    return Promise.resolve()
                }}
            />
        )

        fireEvent.scroll(container.firstChild, {target: {scrollTop: 10}})
        expect(load).not.toBeCalled()
    })

    it('should trigger load on scroll to bottom with different threshold', () => {
        const load = jest.fn()
        const {container} = render(
            <InfiniteScroll
                threshold={1}
                onLoad={() => {
                    load()
                    return Promise.resolve()
                }}
            />
        )

        fireEvent.scroll(container.firstChild, {
            target: {scrollTop: 100},
        })
        expect(load).toBeCalled()
    })

    it('should not trigger load with shouldLoadMore=false', () => {
        const load = jest.fn()
        const {container} = render(
            <InfiniteScroll
                shouldLoadMore={false}
                onLoad={() => {
                    load()
                    return Promise.resolve()
                }}
            />
        )

        fireEvent.scroll(container.firstChild, {target: {scrollTop: 50}})
        expect(load).not.toBeCalled()
    })

    it('should call onLoad when is able to load more', async () => {
        const props = {onLoad: jest.fn(), shouldLoadMore: true, threshold: 100}
        const {rerender} = render(<InfiniteScroll {...props} />)

        await waitFor(() => expect(props.onLoad).toHaveBeenCalledTimes(1))
        rerender(<InfiniteScroll {...props} shouldLoadMore={false} />)
        rerender(<InfiniteScroll {...props} />)
        await waitFor(() => expect(props.onLoad).toHaveBeenCalledTimes(2))
    })
})
