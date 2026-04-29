import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import BrowseAllActionsButton from '../BrowseAllActionsButton'

describe('<BrowseAllActionsButton />', () => {
    it('should render component', () => {
        render(<BrowseAllActionsButton />)
        expect(screen.getByText('Create from template')).toBeInTheDocument()
    })
})
