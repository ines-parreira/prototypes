import React from 'react'

import { render } from '@repo/testing'

import { TicketSkeleton } from '../TicketSkeleton'

describe('<TicketSkeleton/>', () => {
    it('should render a ticket skeleton', () => {
        const { getAllByLabelText } = render(<TicketSkeleton />)
        expect(getAllByLabelText('Loading')).toHaveLength(3)
    })
})
