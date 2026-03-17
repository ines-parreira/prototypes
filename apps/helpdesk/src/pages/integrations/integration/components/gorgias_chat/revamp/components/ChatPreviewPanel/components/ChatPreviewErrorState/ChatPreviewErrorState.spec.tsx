import { render, screen } from '@testing-library/react'

import { ChatPreviewErrorState } from './ChatPreviewErrorState'

describe('ChatPreviewErrorState', () => {
    it('renders the error message', () => {
        render(<ChatPreviewErrorState />)

        expect(
            screen.getByText('Chat preview could not be loaded.'),
        ).toBeInTheDocument()
    })
})
