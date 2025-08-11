import React from 'react'

import { render } from '@testing-library/react'

import TicketSkeleton from '../TicketSkeleton'

jest.mock('@gorgias/axiom', () => ({
    Skeleton: () => <div>skeleton</div>,
}))

describe('<TicketSkeleton/>', () => {
    it('should render a ticket skeleton', () => {
        const { getAllByText } = render(<TicketSkeleton />)
        expect(getAllByText('skeleton')).toHaveLength(3)
    })
})
