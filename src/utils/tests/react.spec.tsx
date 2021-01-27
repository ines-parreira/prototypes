import React from 'react'
import {render} from '@testing-library/react'

import {ComposedElements} from '../react'

describe('react', () => {
    describe('<ComposedElements />', () => {
        it('should return null when children array is empty', () => {
            const {container} = render(<ComposedElements elements={[]} />)
            expect(container.firstChild).toBe(null)
        })

        it('should render children of the composed elements', () => {
            const {container} = render(
                <ComposedElements
                    elements={[
                        <div key="outer-wrapper" />,
                        <span key="inner-wrapper" />,
                    ]}
                >
                    Foo
                </ComposedElements>
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should pass props to the first wrapped component', () => {
            const {container} = render(
                <ComposedElements
                    className="foo"
                    elements={[
                        <div key="outer-wrapper" />,
                        <span key="inner-wrapper" />,
                    ]}
                >
                    Foo
                </ComposedElements>
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should filter out invalid elements', () => {
            const {container} = render(
                <ComposedElements
                    elements={[<div key="wrapper" />, undefined, 1, 'foo']}
                >
                    <span>Foo</span>
                </ComposedElements>
            )
            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
