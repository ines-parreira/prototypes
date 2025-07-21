import React from 'react'

import { render } from '@testing-library/react'

import ViewName from '../ViewName'

const defaultView = {
    name: 'foo bar',
}

describe('<ViewName/>', () => {
    describe('.render()', () => {
        it('should display view name', () => {
            const { container } = render(
                <ViewName viewName={defaultView.name} />,
            )
            expect(container).toMatchSnapshot()
        })

        it('should display emoji', () => {
            const { container } = render(
                <ViewName viewName={defaultView.name} emoji="X" />,
            )
            expect(container).toMatchSnapshot()
        })

        it('should not display emoji if decoration is not a string', () => {
            const { container } = render(
                <ViewName viewName={defaultView.name} emoji={String(8)} />,
            )
            expect(container).toMatchSnapshot()
        })
    })
})
