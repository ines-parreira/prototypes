import React from 'react'

import { render } from '@testing-library/react'

import CloseTickets from '../CloseTickets'

describe('<CloseTickets />', () => {
    const minProps = {
        onClick: jest.fn(),
        isDisabled: false,
    }

    it('should render', () => {
        const { getByText } = render(<CloseTickets {...minProps} />)

        expect(getByText('check_circle')).toBeInTheDocument()
    })

    it('should trigger callback on click', () => {
        const { getByText } = render(<CloseTickets {...minProps} />)
        getByText('check_circle').click()

        expect(minProps.onClick).toHaveBeenCalled()
    })

    it('should be disabled', () => {
        const { getByText } = render(<CloseTickets {...minProps} isDisabled />)
        getByText('check_circle').click()

        expect(minProps.onClick).not.toHaveBeenCalled()
    })
})
