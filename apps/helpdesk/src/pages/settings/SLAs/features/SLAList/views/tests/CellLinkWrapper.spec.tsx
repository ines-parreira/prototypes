import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import CellLinkWrapper from '../CellLinkWrapper'

describe('<CellLinkWrapper />', () => {
    it('renders a link', () => {
        const { getByText } = render(
            <MemoryRouter>
                <CellLinkWrapper to="/some-path">
                    <span>Some text</span>
                </CellLinkWrapper>
            </MemoryRouter>,
        )

        expect(getByText('Some text')).toBeInTheDocument()
        expect(getByText('Some text').closest('a')).toHaveAttribute(
            'href',
            '/some-path',
        )
    })
})
