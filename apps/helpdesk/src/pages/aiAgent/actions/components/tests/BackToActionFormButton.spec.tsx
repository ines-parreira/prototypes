import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { BackToActionFormButton } from '../BackToActionFormButton'

describe('<BackToActionFormButton />', () => {
    it('should render component', () => {
        render(<BackToActionFormButton />)
        expect(screen.getByText('Back to Support Action')).toBeInTheDocument()
    })
})
