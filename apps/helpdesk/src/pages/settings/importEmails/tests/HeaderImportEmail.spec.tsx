import { render, screen } from '@testing-library/react'

import HeaderImportEmail from '../HeaderImportEmail'

describe('HeaderImportEmail', () => {
    it('renders the page header with correct title', () => {
        render(<HeaderImportEmail onOpenCreateImportModal={() => {}} />)
        expect(screen.getByText(/email import/i)).toBeInTheDocument()
    })

    it('renders the Import button', () => {
        render(<HeaderImportEmail onOpenCreateImportModal={() => {}} />)
        expect(screen.getByText('Import')).toBeInTheDocument()
    })

    it('renders the informational text about importing data', () => {
        render(<HeaderImportEmail onOpenCreateImportModal={() => {}} />)
        expect(
            screen.getByText(/import historical email data to gorgias\./i),
        ).toBeInTheDocument()
    })

    it('renders the Email integrations FAQs link with correct href', () => {
        render(<HeaderImportEmail onOpenCreateImportModal={() => {}} />)
        const link = screen.getByText(/email integrations faqs/i)
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', 'https://link.gorgias.com/m8v')
    })
})
