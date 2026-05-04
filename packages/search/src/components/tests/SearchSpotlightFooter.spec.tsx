import { render } from '@repo/testing/vitest'
import { screen } from '@testing-library/react'

import { SearchSpotlightFooter } from '../SearchSpotlightFooter'

describe('SearchSpotlightFooter', () => {
    it('renders the keyboard shortcut legend', () => {
        render(<SearchSpotlightFooter />)

        expect(screen.getByText('Select')).toBeInTheDocument()
        expect(screen.getByText('Open')).toBeInTheDocument()
        expect(screen.getByText('Open in a new tab')).toBeInTheDocument()
        expect(screen.getByText('↑')).toBeInTheDocument()
        expect(screen.getAllByText('↩').length).toBeGreaterThan(0)
    })
})
