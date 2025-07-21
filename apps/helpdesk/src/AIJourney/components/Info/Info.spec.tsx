import React from 'react'

import { render, screen } from '@testing-library/react'

import { Info } from './Info'

describe('<Info />', () => {
    it('should render content properly', () => {
        render(<Info content={'No love, however brief, is wasted.'} />)

        expect(
            screen.getByText('No love, however brief, is wasted.'),
        ).toBeInTheDocument()
    })
})
