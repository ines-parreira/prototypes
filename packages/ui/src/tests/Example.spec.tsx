import { describe, expect, it } from 'vitest'

import { render } from '@repo/testing/vitest'
import { Example } from '../components/Example'

describe('Example', () => {
    it('should render', () => {
        const { getByText } = render(<Example />)
        expect(getByText('Example')).toBeInTheDocument()
    })
})
