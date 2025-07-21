import { render, screen } from '@testing-library/react'

import FormSectionCard from '../FormSectionCard'

describe('FormSectionCard', () => {
    it('renders children', () => {
        render(<FormSectionCard>test content</FormSectionCard>)

        expect(screen.getByText('test content')).toBeInTheDocument()
    })
})
