import React from 'react'
import {fireEvent, render} from '@testing-library/react'

import {Title} from '../Title'

describe('<Title>', () => {
    it('matches snapshot', () => {
        const {container} = render(<Title>Standard logo</Title>)
        expect(container).toMatchSnapshot()
    })

    it('shows tooltip if we have help text', async () => {
        const {getByRole, findByText} = render(
            <Title help="Used in the main navigation when with the dark theme.">
                Standard logo
            </Title>
        )

        fireEvent.mouseEnter(getByRole('img'))

        await findByText(
            'Used in the main navigation when with the dark theme.'
        )
    })
})
