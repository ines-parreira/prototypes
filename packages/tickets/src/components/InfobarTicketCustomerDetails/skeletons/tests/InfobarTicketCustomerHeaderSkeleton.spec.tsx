import { render } from '@repo/testing/vitest'
import { screen } from '@testing-library/react'

import { InfobarTicketCustomerHeaderSkeleton } from '../InfobarTicketCustomerHeaderSkeleton'

describe('InfobarTicketCustomerHeaderSkeleton', () => {
    it('renders an avatar and name skeleton', () => {
        render(<InfobarTicketCustomerHeaderSkeleton />)

        expect(screen.getAllByLabelText('Loading')).toHaveLength(2)
    })
})
