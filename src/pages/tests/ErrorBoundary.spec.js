import React from 'react'
import {mount} from 'enzyme'

import {ErrorBoundary} from '../ErrorBoundary.tsx'

describe('<ErrorBoundary/>', () => {
    const Foo = () => <div>foo</div>

    it('should render children when there is no error', () => {
        const component = mount(
            <ErrorBoundary>
                <Foo />
            </ErrorBoundary>
        )

        expect(component).toMatchSnapshot()
    })

    it('should render an error message because an error occurred', () => {
        const component = mount(
            <ErrorBoundary>
                <Foo />
            </ErrorBoundary>
        )

        const error = new Error('Fake error')
        component.find(Foo).simulateError(error)

        expect(component).toMatchSnapshot()
    })
})
