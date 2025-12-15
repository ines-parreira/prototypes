import { render, screen } from '@testing-library/react'
import user from '@testing-library/user-event'

import { HeaderImport } from './HeaderImport'

describe('HeaderImport', () => {
    const mockOnOpenCreateImportModal = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Page Header', () => {
        it('renders the page header with correct title', () => {
            render(
                <HeaderImport
                    onOpenCreateImportModal={mockOnOpenCreateImportModal}
                    showCta={false}
                />,
            )
            expect(
                screen.getByRole('heading', { name: /email import/i }),
            ).toBeInTheDocument()
        })
    })

    describe('Import Button', () => {
        it('renders the Import button when showCta is true', () => {
            render(
                <HeaderImport
                    onOpenCreateImportModal={mockOnOpenCreateImportModal}
                    showCta={true}
                />,
            )
            expect(
                screen.getByRole('button', { name: /import/i }),
            ).toBeInTheDocument()
        })

        it('does not render the Import button when showCta is false', () => {
            render(
                <HeaderImport
                    onOpenCreateImportModal={mockOnOpenCreateImportModal}
                    showCta={false}
                />,
            )
            expect(
                screen.queryByRole('button', { name: /import/i }),
            ).not.toBeInTheDocument()
        })

        it('calls onOpenCreateImportModal when Import button is clicked', async () => {
            const userActions = user.setup()
            render(
                <HeaderImport
                    onOpenCreateImportModal={mockOnOpenCreateImportModal}
                    showCta={true}
                />,
            )

            await userActions.click(
                screen.getByRole('button', { name: /import/i }),
            )
            expect(mockOnOpenCreateImportModal).toHaveBeenCalledTimes(1)
        })
    })

    describe('Content', () => {
        it('renders the informational text about importing data', () => {
            render(
                <HeaderImport
                    onOpenCreateImportModal={mockOnOpenCreateImportModal}
                    showCta={false}
                />,
            )
            expect(
                screen.getByText(/import historical email data to gorgias\./i),
            ).toBeInTheDocument()
        })

        it('renders the Email integrations FAQs link with correct href', () => {
            render(
                <HeaderImport
                    onOpenCreateImportModal={mockOnOpenCreateImportModal}
                    showCta={false}
                />,
            )
            const link = screen.getByText(/email import guide/i)
            expect(link).toBeInTheDocument()
            expect(link).toHaveAttribute('href', 'https://link.gorgias.com/vkf')
        })
    })
})
