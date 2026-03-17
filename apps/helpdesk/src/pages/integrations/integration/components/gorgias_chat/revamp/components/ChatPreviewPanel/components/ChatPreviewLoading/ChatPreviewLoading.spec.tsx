import { render, screen } from '@testing-library/react'

import { ChatPreviewLoading } from './ChatPreviewLoading'

describe('ChatPreviewLoading', () => {
    it('renders the loading text', () => {
        render(<ChatPreviewLoading />)

        expect(screen.getByText('Loading Preview...')).toBeInTheDocument()
    })
})
