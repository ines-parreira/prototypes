import { screen } from '@testing-library/react'

import { render, testAppQueryClient } from '../../../../../tests/render.utils'
import { TicketListItemSkeleton } from '../TicketListItemSkeleton'

beforeEach(() => {
    testAppQueryClient.clear()
})

describe('TicketListItemSkeleton', () => {
    it('renders skeleton placeholders', () => {
        render(<TicketListItemSkeleton />)
        expect(screen.getAllByLabelText('Loading')).toHaveLength(4)
    })
})
