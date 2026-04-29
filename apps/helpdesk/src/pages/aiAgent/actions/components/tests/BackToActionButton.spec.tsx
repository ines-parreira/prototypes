import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import BackToActionButton from '../BackToActionButton'

describe('<BackToActionButton />', () => {
    it('should render component', () => {
        render(<BackToActionButton />)
        expect(screen.getByText('Back to Support Actions')).toBeInTheDocument()
    })
})
