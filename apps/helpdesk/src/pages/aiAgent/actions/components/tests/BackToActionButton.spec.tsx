import { mockFeatureFlagsValues } from '@repo/feature-flags/testing'
import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { BackToActionButton } from '../BackToActionButton'

describe('<BackToActionButton />', () => {
    it('renders "Back to Support Actions" when the ActionCentralizedLibrary flag is below MILESTONE-2', () => {
        render(<BackToActionButton />)
        expect(screen.getByText('Back to Support Actions')).toBeInTheDocument()
    })

    it('renders "Back to Actions" when the ActionCentralizedLibrary flag is MILESTONE-2 or above', () => {
        mockFeatureFlagsValues({
            'action-centralized-library': 'MILESTONE-2',
        })

        render(<BackToActionButton />)
        expect(screen.getByText('Back to Actions')).toBeInTheDocument()
    })
})
