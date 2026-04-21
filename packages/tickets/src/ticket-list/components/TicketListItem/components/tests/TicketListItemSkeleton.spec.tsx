import { screen } from '@testing-library/react'

import { render } from '../../../../../tests/render.utils'
import { TicketListItemSkeleton } from '../TicketListItemSkeleton'

describe('TicketListItemSkeleton', () => {
    it('renders skeleton placeholders', () => {
        render(<TicketListItemSkeleton />)
        expect(screen.getAllByLabelText('Loading')).toHaveLength(4)
    })
})
