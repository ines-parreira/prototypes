import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import CreateCustomActionButton from '../CreateCustomActionButton'

describe('<CreateCustomActionButton />', () => {
    it('should render component', () => {
        render(<CreateCustomActionButton />)
        expect(screen.getByText('Create Custom Action')).toBeInTheDocument()
    })
})
