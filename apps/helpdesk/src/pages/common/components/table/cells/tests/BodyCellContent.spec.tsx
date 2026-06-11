import React from 'react'

import { render } from '@repo/testing'

import { BodyCellContent } from '../BodyCellContent'

describe('<BodyCellContent/>', () => {
    it('should render', () => {
        const { container } = render(
            <BodyCellContent className="foo">Foo</BodyCellContent>,
        )

        expect(container).toMatchSnapshot()
    })

    it('should render with custom width', () => {
        const { container } = render(
            <BodyCellContent className="foo" width={200}>
                Foo
            </BodyCellContent>,
        )

        expect(container).toMatchSnapshot()
    })
})
