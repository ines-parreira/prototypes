import React from 'react'

import { render, screen } from '@testing-library/react'

import FailedMessageLabel from 'ticket-list-view/components/FailedMessageLabel'

describe('<FailedMessageLabel />', () => {
    it('should render the failed message text', () => {
        render(<FailedMessageLabel />)

        expect(
            screen.getByText('Last message not delivered'),
        ).toBeInTheDocument()
    })

    it('should render the warning icon', () => {
        render(<FailedMessageLabel />)

        expect(screen.getByText('warning')).toBeInTheDocument()
    })
})
