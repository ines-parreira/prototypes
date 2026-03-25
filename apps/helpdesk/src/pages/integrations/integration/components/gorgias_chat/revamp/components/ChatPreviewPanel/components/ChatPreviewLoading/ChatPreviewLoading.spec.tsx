import { render, screen } from '@testing-library/react'

import { ChatPreviewLoading } from './ChatPreviewLoading'

describe('ChatPreviewLoading', () => {
    it('renders the loading indicator and text', () => {
        render(<ChatPreviewLoading />)

        expect(screen.getByLabelText('Loading preview')).toBeInTheDocument()
        expect(screen.getByText('Loading preview...')).toBeInTheDocument()
    })
})
