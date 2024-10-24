import {render} from '@testing-library/react'
import React from 'react'

import TicketSkeleton from '../TicketSkeleton'

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => {
    return <div>skeleton</div>
})

describe('<TicketSkeleton/>', () => {
    it('should render a ticket skeleton', () => {
        const {getAllByText} = render(<TicketSkeleton />)
        expect(getAllByText('skeleton')).toHaveLength(3)
    })
})
