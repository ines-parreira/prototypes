import React from 'react'
import {render, waitFor} from '@testing-library/react'

import CloseTickets from '../CloseTickets'

describe('<CloseTickets />', () => {
    const minProps = {
        onClick: jest.fn(),
        isDisabled: false,
    }

    it('should render', () => {
        const {getByText} = render(<CloseTickets {...minProps} />)

        expect(getByText('check_circle')).toBeInTheDocument()
    })

    it('should trigger callback on click', async () => {
        const {getByText} = render(<CloseTickets {...minProps} />)
        getByText('check_circle').click()

        await waitFor(() => expect(minProps.onClick).toHaveBeenCalled())
    })
})
