import React from 'react'
import {shallow} from 'enzyme'

import InfiniteScroll from '../InfiniteScroll.tsx'

describe('InfiniteScroll component', () => {
    it('should display infinite scroll with children', () => {
        const component = shallow(
            <InfiniteScroll>
                <div>Pizza Pepperoni</div>
            </InfiniteScroll>
        )

        expect(component).toMatchSnapshot()
    })

    it('should trigger load on scroll to bottom', (done) => {
        const load = jest.fn()
        const component = shallow(
            <InfiniteScroll
                load={() => {
                    load()
                    done()
                    return Promise.resolve()
                }}
            />
        )

        // simulate scroll to bottom
        const event = {
            target: {
                scrollTop: 1,
                clientHeight: 1,
                scrollHeight: 2,
            },
        }
        component.prop('onScroll')(event)

        expect(load).toBeCalled()
        expect(component.state('loading')).toBe(true)
    })

    it('should not trigger load when not scrolled to bottom', (done) => {
        const load = jest.fn()
        const component = shallow(
            <InfiniteScroll
                load={() => {
                    load()
                    return Promise.resolve()
                }}
            />
        )

        // simulate scroll to bottom
        const event = {
            target: {
                scrollTop: 1,
                clientHeight: 1,
                // default threshold is 50
                scrollHeight: 53,
            },
        }
        component.prop('onScroll')(event)

        expect(load).not.toBeCalled()

        // give it some time for the load promise
        setTimeout(done, 500)
    })

    it('should trigger load on scroll to bottom with different threshold', (done) => {
        const load = jest.fn()
        const component = shallow(
            <InfiniteScroll
                threshold={1}
                load={() => {
                    load()
                    done()
                    return Promise.resolve()
                }}
            />
        )

        // simulate scroll to bottom
        const event = {
            target: {
                scrollTop: 1,
                clientHeight: 1,
                scrollHeight: 3,
            },
        }
        component.prop('onScroll')(event)

        expect(load).toBeCalled()
    })

    it('should not trigger load with loadMore=false', (done) => {
        const load = jest.fn()
        const component = shallow(
            <InfiniteScroll
                loadMore={false}
                load={() => {
                    load()
                    return Promise.resolve()
                }}
            />
        )

        // simulate scroll to bottom
        const event = {
            target: {
                scrollTop: 1,
                clientHeight: 1,
                scrollHeight: 1,
            },
        }
        component.prop('onScroll')(event)

        expect(load).not.toBeCalled()

        // give it some time for the load promise
        setTimeout(done, 500)
    })
})
