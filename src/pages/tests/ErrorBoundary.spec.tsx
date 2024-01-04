import React from 'react'
import {render} from '@testing-library/react'

import {ErrorBoundary} from '../ErrorBoundary'

describe('<ErrorBoundary/>', () => {
    it('should render children when there is no error', () => {
        const Foo = () => <div>foo</div>
        const {container} = render(
            <ErrorBoundary>
                <Foo />
            </ErrorBoundary>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render an error message because an error occurred', () => {
        const Foo = () => {
            throw new Error('foo')
        }

        const {container} = render(
            <ErrorBoundary>
                <Foo />
            </ErrorBoundary>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
