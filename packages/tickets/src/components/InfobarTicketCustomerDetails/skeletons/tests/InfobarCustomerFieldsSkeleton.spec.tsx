import { render } from '@repo/testing/vitest'
import { screen } from '@testing-library/react'

import { InfobarCustomerFieldsSkeleton } from '../InfobarCustomerFieldsSkeleton'

describe('InfobarCustomerFieldsSkeleton', () => {
    it('renders a label and value skeleton for each field row', () => {
        render(<InfobarCustomerFieldsSkeleton />)

        expect(screen.getAllByLabelText('Loading')).toHaveLength(5 * 2)
    })
})
