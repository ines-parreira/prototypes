import React from 'react'

import { render } from '@repo/testing'

import TicketSkeleton from '../TicketSkeleton'

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Skeleton: () => <div>skeleton</div>,
}))

describe('<TicketSkeleton/>', () => {
    it('should render a ticket skeleton', () => {
        const { getAllByText } = render(<TicketSkeleton />)
        expect(getAllByText('skeleton')).toHaveLength(3)
    })
})
