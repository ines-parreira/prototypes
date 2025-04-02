import { render } from '@testing-library/react'

import { NoResults } from '../NoResults'

describe('NoResults', () => {
    it('should render children', () => {
        const { getByText } = render(<NoResults>Test</NoResults>)
        expect(getByText('Test')).toBeInTheDocument()
    })
})
