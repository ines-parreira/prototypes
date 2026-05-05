import { render } from '@repo/testing'

import { NoResults } from '../NoResults'

describe('NoResults', () => {
    it('should render children', () => {
        const { getByText } = render(<NoResults>Test</NoResults>)
        expect(getByText('Test')).toBeInTheDocument()
    })
})
