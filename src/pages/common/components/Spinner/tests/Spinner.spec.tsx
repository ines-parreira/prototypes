import React from 'react'
import {render, screen} from '@testing-library/react'

import Spinner from '../Spinner'

describe('<Spinner />', () => {
    it('should render a spinner', () => {
        const {container} = render(<Spinner size="medium" />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a spinner with a width', () => {
        const width = '100px'
        render(<Spinner width={width} />)

        expect(screen.getByRole('status')).toHaveAttribute('width', width)
        expect(screen.getByRole('status')).toHaveAttribute('height', width)
    })
})
