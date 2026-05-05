import { render } from '@repo/testing/vitest'
import { screen } from '@testing-library/react'

import { CustomerDetailsBodySkeleton } from '../CustomerDetailsBodySkeleton'

describe('CustomerDetailsBodySkeleton', () => {
    it('renders a label and value skeleton for each field row', () => {
        render(<CustomerDetailsBodySkeleton />)

        expect(screen.getAllByLabelText('Loading')).toHaveLength(6 * 2)
    })
})
