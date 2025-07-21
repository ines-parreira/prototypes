import { render, screen } from '@testing-library/react'

import SectionHeader from './SectionHeader'

const renderComponent = (props: { title: string; description?: string }) => {
    return render(<SectionHeader {...props} />)
}

describe('SectionHeader', () => {
    it('renders title', () => {
        renderComponent({ title: 'Test Title' })

        expect(screen.getByText('Test Title')).toBeInTheDocument()
    })

    it('renders description when provided', () => {
        renderComponent({
            title: 'Test Title',
            description: 'Test Description',
        })

        expect(screen.getByText('Test Description')).toBeInTheDocument()
    })
})
