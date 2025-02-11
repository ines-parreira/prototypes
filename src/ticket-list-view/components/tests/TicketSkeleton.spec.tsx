import {render} from '@testing-library/react'
import React from 'react'

import TicketSkeleton from '../TicketSkeleton'

jest.mock('@gorgias/merchant-ui-kit', () => ({
    Skeleton: () => <div>skeleton</div>,
}))

describe('<TicketSkeleton/>', () => {
    it('should render a ticket skeleton', () => {
        const {getAllByText} = render(<TicketSkeleton />)
        expect(getAllByText('skeleton')).toHaveLength(3)
    })
})
