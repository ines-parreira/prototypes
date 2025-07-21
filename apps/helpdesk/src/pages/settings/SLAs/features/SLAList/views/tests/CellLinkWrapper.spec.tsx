import React from 'react'

import { render } from '@testing-library/react'

import CellLinkWrapper from '../CellLinkWrapper'

describe('<CellLinkWrapper />', () => {
    it('renders a link', () => {
        const { getByText } = render(
            <CellLinkWrapper to="/some-path">
                <span>Some text</span>
            </CellLinkWrapper>,
        )

        expect(getByText('Some text')).toBeInTheDocument()
        expect(getByText('Some text').closest('a')).toHaveAttribute(
            'to',
            '/some-path',
        )
    })
})
