import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryHistory } from 'history'
import { Router } from 'react-router-dom'

import ImportEmail from './Import'

// Polyfill for getAnimations which is not available in JSDOM
Element.prototype.getAnimations = jest.fn().mockReturnValue([])

// Mock all child components
jest.mock('./HeaderImport', () => ({
    HeaderImport: function MockHeaderImport({
        onOpenCreateImportModal,
        showCta,
    }: any) {
        return (
            <div data-testid="header-import-email">
                <button onClick={onOpenCreateImportModal}>
                    Open Create Import Modal
                </button>
                <div data-testid="show-cta">{showCta ? 'true' : 'false'}</div>
            </div>
        )
    },
}))

jest.mock('./Modal/EmailImportModalWizard', () => ({
    EmailImportModalWizard: function MockEmailImportModalWizard({
        selectedEmail,
        isOpen,
        onClose,
    }: any) {
        if (!isOpen) return null
        return (
            <div data-testid="create-import-modal">
                <div data-testid="modal-open">true</div>
                <div data-testid="selected-email">
                    {selectedEmail === null ? 'null' : selectedEmail}
                </div>
                <button onClick={onClose}>Close Modal</button>
            </div>
        )
    },
}))

jest.mock('./Modal/ZendeskImportModalWizard', () => ({
    ZendeskImportModalWizard: function MockZendeskImportModalWizard({
        onClose,
    }: {
        onClose: () => void
    }) {
        return (
            <div role="dialog" aria-label="Import Zendesk data">
                <h2>Import Zendesk data</h2>
                <button onClick={onClose}>Cancel</button>
                <button>Import</button>
            </div>
        )
    },
}))

jest.mock('./Imports/Email/ImportEmailTable', () => ({
    ImportEmailTable: function MockImportEmailTable({
        onOpenCreateImportModal,
        ...tableProps
    }: any) {
        return (
            <div data-testid="table-import-email">
                <button onClick={onOpenCreateImportModal}>
                    Table Open Create Import Modal
                </button>
                <div data-testid="table-props">
                    {JSON.stringify(tableProps)}
                </div>
            </div>
        )
    },
}))

jest.mock('./Imports/Zendesk/ZendeskImportTable', () => ({
    ZendeskImportTable: function MockZendeskImportTable() {
        return <div data-testid="zendesk-import-table" />
    },
}))

jest.mock('./Imports/Email/useTableImport', () => ({
    useTableImport: jest.fn(),
}))

const mockUseTableImport = jest.mocked(
    require('./Imports/Email/useTableImport').useTableImport,
)

describe('ImportEmail', () => {
    const defaultTableProps = {
        importList: [],
        loading: false,
        error: null,
    }

    beforeEach(() => {
        mockUseTableImport.mockReturnValue({
            tableProps: defaultTableProps,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    const renderComponent = (initialPath = '/historical-imports') => {
        const history = createMemoryHistory({
            initialEntries: [initialPath],
        })
        const result = render(
            <Router history={history}>
                <ImportEmail />
            </Router>,
        )
        return { ...result, history }
    }

    describe('Component rendering', () => {
        it('should render all main components', () => {
            renderComponent()

            expect(
                screen.getByTestId('header-import-email'),
            ).toBeInTheDocument()
            expect(screen.getByTestId('table-import-email')).toBeInTheDocument()
            expect(
                screen.queryByTestId('create-import-modal'),
            ).not.toBeInTheDocument()
        })

        it('should have correct container class', () => {
            const { container } = renderComponent()

            expect(container.firstChild).toHaveClass('full-width')
        })
    })

    describe('URL parameter parsing', () => {
        it('should extract selectedEmail from URL query parameters', () => {
            renderComponent(
                '/historical-imports?selectedEmail=test@example.com',
            )

            expect(screen.getByTestId('selected-email')).toHaveTextContent(
                'test@example.com',
            )
        })

        it('should handle null selectedEmail when no query parameter is present', () => {
            renderComponent('/historical-imports')

            expect(
                screen.queryByTestId('create-import-modal'),
            ).not.toBeInTheDocument()
        })

        it('should handle empty selectedEmail parameter', () => {
            renderComponent('/historical-imports?selectedEmail=')

            expect(
                screen.queryByTestId('create-import-modal'),
            ).not.toBeInTheDocument()
        })

        it('should handle URL encoded email addresses', () => {
            renderComponent(
                '/historical-imports?selectedEmail=test%40example.com',
            )

            expect(screen.getByTestId('selected-email')).toHaveTextContent(
                'test@example.com',
            )
        })

        it('should handle multiple query parameters', () => {
            renderComponent(
                '/historical-imports?selectedEmail=test@example.com&other=value',
            )

            expect(screen.getByTestId('selected-email')).toHaveTextContent(
                'test@example.com',
            )
        })
    })

    describe('Active tab query parameter', () => {
        it('should default to Email Import tab when no activeTab query param is present', async () => {
            const { history } = renderComponent('/historical-imports')

            expect(screen.getByTestId('table-import-email')).toBeInTheDocument()

            await waitFor(() => {
                expect(history.location.search).toContain(
                    'activeTab=import-email',
                )
            })
        })

        it('should open Email Import tab when activeTab=import-email', async () => {
            const { history } = renderComponent(
                '/historical-imports?activeTab=import-email',
            )

            expect(screen.getByTestId('table-import-email')).toBeInTheDocument()
            expect(history.location.search).toContain('activeTab=import-email')
        })

        it('should open Zendesk Import tab when activeTab=import-zendesk', async () => {
            const { history } = renderComponent(
                '/historical-imports?activeTab=import-zendesk',
            )

            expect(
                screen.getByTestId('zendesk-import-table'),
            ).toBeInTheDocument()
            expect(history.location.search).toContain(
                'activeTab=import-zendesk',
            )
        })

        it('should update URL when switching tabs', async () => {
            const user = userEvent.setup()
            const { history } = renderComponent('/historical-imports')

            await waitFor(() => {
                expect(history.location.search).toContain(
                    'activeTab=import-email',
                )
            })

            await user.click(
                screen.getByRole('tab', { name: 'Zendesk Import' }),
            )

            await waitFor(() => {
                expect(history.location.search).toContain(
                    'activeTab=import-zendesk',
                )
            })
        })

        it('should update URL when switching from Zendesk to Email tab', async () => {
            const user = userEvent.setup()
            const { history } = renderComponent(
                '/historical-imports?activeTab=import-zendesk',
            )

            expect(history.location.search).toContain(
                'activeTab=import-zendesk',
            )

            await user.click(screen.getByRole('tab', { name: 'Email Import' }))

            await waitFor(() => {
                expect(history.location.search).toContain(
                    'activeTab=import-email',
                )
            })
        })

        it('should preserve other query params when updating activeTab', async () => {
            const user = userEvent.setup()
            const { history } = renderComponent(
                '/historical-imports?selectedEmail=test@example.com&other=value',
            )

            await waitFor(() => {
                expect(history.location.search).toContain(
                    'activeTab=import-email',
                )
            })

            expect(decodeURIComponent(history.location.search)).toContain(
                'selectedEmail=test@example.com',
            )
            expect(history.location.search).toContain('other=value')

            await user.click(
                screen.getByRole('tab', { name: 'Zendesk Import' }),
            )

            await waitFor(() => {
                expect(history.location.search).toContain(
                    'activeTab=import-zendesk',
                )
            })

            expect(decodeURIComponent(history.location.search)).toContain(
                'selectedEmail=test@example.com',
            )
            expect(decodeURIComponent(history.location.search)).toContain(
                'other=value',
            )
        })

        it('should handle invalid activeTab values by defaulting to Email Import', async () => {
            const { history } = renderComponent(
                '/historical-imports?activeTab=invalid',
            )

            expect(screen.getByTestId('table-import-email')).toBeInTheDocument()

            await waitFor(() => {
                expect(history.location.search).toContain(
                    'activeTab=import-email',
                )
            })
        })
    })

    describe('Modal auto-opening behavior', () => {
        it('should auto-open modal when selectedEmail is present', () => {
            renderComponent(
                '/historical-imports?selectedEmail=test@example.com',
            )

            expect(
                screen.getByTestId('create-import-modal'),
            ).toBeInTheDocument()
            expect(screen.getByTestId('modal-open')).toHaveTextContent('true')
        })

        it('should not auto-open modal when selectedEmail is null', () => {
            renderComponent('/historical-imports')

            expect(
                screen.queryByTestId('create-import-modal'),
            ).not.toBeInTheDocument()
        })

        it('should not auto-open modal when selectedEmail is empty string', () => {
            renderComponent('/historical-imports?selectedEmail=')

            expect(
                screen.queryByTestId('create-import-modal'),
            ).not.toBeInTheDocument()
        })

        it('should auto-open modal for any non-empty selectedEmail value', () => {
            renderComponent('/historical-imports?selectedEmail=any-value')

            expect(
                screen.getByTestId('create-import-modal'),
            ).toBeInTheDocument()
            expect(screen.getByTestId('modal-open')).toHaveTextContent('true')
        })
    })

    describe('Modal interactions', () => {
        it('should open modal when header button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent('/historical-imports')

            // Initially closed
            expect(
                screen.queryByTestId('create-import-modal'),
            ).not.toBeInTheDocument()

            // Click header button
            await user.click(screen.getByText('Open Create Import Modal'))

            // Should be open
            expect(
                screen.getByTestId('create-import-modal'),
            ).toBeInTheDocument()
            expect(screen.getByTestId('modal-open')).toHaveTextContent('true')
        })

        it('should open modal when table button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent('/historical-imports')

            // Initially closed
            expect(
                screen.queryByTestId('create-import-modal'),
            ).not.toBeInTheDocument()

            // Click table button
            await user.click(screen.getByText('Table Open Create Import Modal'))

            // Should be open
            expect(
                screen.getByTestId('create-import-modal'),
            ).toBeInTheDocument()
            expect(screen.getByTestId('modal-open')).toHaveTextContent('true')
        })

        it('should close modal when close button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent(
                '/historical-imports?selectedEmail=test@example.com',
            )

            // Initially open due to selectedEmail
            expect(
                screen.getByTestId('create-import-modal'),
            ).toBeInTheDocument()
            expect(screen.getByTestId('modal-open')).toHaveTextContent('true')

            // Click close button
            await user.click(screen.getByText('Close Modal'))

            // Should be closed
            expect(
                screen.queryByTestId('create-import-modal'),
            ).not.toBeInTheDocument()
        })

        it('should be able to open modal after closing it', async () => {
            const user = userEvent.setup()
            renderComponent(
                '/historical-imports?selectedEmail=test@example.com',
            )

            // Initially open
            expect(
                screen.getByTestId('create-import-modal'),
            ).toBeInTheDocument()
            expect(screen.getByTestId('modal-open')).toHaveTextContent('true')

            // Close modal
            await user.click(screen.getByText('Close Modal'))
            expect(
                screen.queryByTestId('create-import-modal'),
            ).not.toBeInTheDocument()

            // Open modal again via header
            await user.click(screen.getByText('Open Create Import Modal'))
            expect(
                screen.getByTestId('create-import-modal'),
            ).toBeInTheDocument()
            expect(screen.getByTestId('modal-open')).toHaveTextContent('true')
        })
    })

    describe('Props passing', () => {
        it('should pass selectedEmail to CreateImportModal', () => {
            renderComponent('/historical-imports?selectedEmail=test@gmail.com')

            expect(screen.getByTestId('selected-email')).toHaveTextContent(
                'test@gmail.com',
            )
        })

        it('should pass correct showCta to HeaderImportEmail when importList has items', () => {
            mockUseTableImport.mockReturnValue({
                tableProps: {
                    ...defaultTableProps,
                    importList: [{ id: 1, name: 'Import 1' }],
                },
            })

            renderComponent()

            expect(screen.getByTestId('show-cta')).toHaveTextContent('true')
        })

        it('should pass correct showCta to HeaderImportEmail when importList is empty', () => {
            mockUseTableImport.mockReturnValue({
                tableProps: {
                    ...defaultTableProps,
                    importList: [],
                },
            })

            renderComponent()

            expect(screen.getByTestId('show-cta')).toHaveTextContent('false')
        })

        it('should pass tableProps to TableImportEmail', () => {
            const customTableProps = {
                importList: [{ id: 1, name: 'Test Import' }],
                loading: true,
                error: 'Test error',
            }

            mockUseTableImport.mockReturnValue({
                tableProps: customTableProps,
            })

            renderComponent()

            const tablePropsElement = screen.getByTestId('table-props')
            expect(tablePropsElement).toHaveTextContent(
                JSON.stringify(customTableProps),
            )
        })
    })

    describe('Edge cases and error handling', () => {
        it('should handle malformed URL parameters gracefully', () => {
            renderComponent('/historical-imports?selectedEmail=%')

            // Should not crash and should render the component
            expect(
                screen.getByTestId('header-import-email'),
            ).toBeInTheDocument()
        })

        it('should handle special characters in selectedEmail', () => {
            const specialEmail = 'test+tag@example-domain.co.uk'
            renderComponent(
                `/historical-imports?selectedEmail=${encodeURIComponent(specialEmail)}`,
            )

            expect(screen.getByTestId('selected-email')).toHaveTextContent(
                specialEmail,
            )
            expect(screen.getByTestId('modal-open')).toHaveTextContent('true')
        })

        it('should handle useTableImport returning undefined gracefully', () => {
            mockUseTableImport.mockReturnValue({
                tableProps: {
                    importList: undefined,
                } as any,
            })

            // Should not crash and should render components
            renderComponent()

            expect(
                screen.getByTestId('header-import-email'),
            ).toBeInTheDocument()
            expect(screen.getByTestId('show-cta')).toHaveTextContent('false')
        })

        it('should work with different URL paths', () => {
            renderComponent(
                '/app/settings/historical-imports?selectedEmail=test@example.com',
            )

            expect(screen.getByTestId('selected-email')).toHaveTextContent(
                'test@example.com',
            )
            expect(screen.getByTestId('modal-open')).toHaveTextContent('true')
        })
    })

    describe('Integration with useTableImport hook', () => {
        it('should call useTableImport hook', () => {
            mockUseTableImport.mockClear()
            renderComponent()

            expect(mockUseTableImport).toHaveBeenCalled()
        })

        it('should pass tableProps from useTableImport to TableImportEmail', () => {
            const mockTableProps = {
                importList: [{ id: 1 }, { id: 2 }],
                loading: false,
                error: null,
                customProp: 'test',
            }

            mockUseTableImport.mockReturnValue({
                tableProps: mockTableProps,
            })

            renderComponent()

            const tablePropsElement = screen.getByTestId('table-props')
            expect(tablePropsElement).toHaveTextContent(
                JSON.stringify(mockTableProps),
            )
        })
    })

    describe('Tabs', () => {
        it('should render both import tabs', () => {
            renderComponent()

            expect(
                screen.getByRole('tab', { name: 'Email Import' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('tab', { name: 'Zendesk Import' }),
            ).toBeInTheDocument()
        })
    })

    describe('Zendesk Import modal interactions', () => {
        it('should open Zendesk modal when clicking header button on Zendesk Import tab', async () => {
            const user = userEvent.setup()
            renderComponent()

            expect(
                screen.queryByRole('dialog', { name: 'Import Zendesk data' }),
            ).not.toBeInTheDocument()

            await user.click(
                screen.getByRole('tab', { name: 'Zendesk Import' }),
            )

            await user.click(screen.getByText('Open Create Import Modal'))

            expect(
                screen.getByRole('dialog', { name: 'Import Zendesk data' }),
            ).toBeInTheDocument()
            expect(
                screen.queryByTestId('create-import-modal'),
            ).not.toBeInTheDocument()
        })

        it('should close Zendesk modal when close button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            await user.click(
                screen.getByRole('tab', { name: 'Zendesk Import' }),
            )

            await user.click(screen.getByText('Open Create Import Modal'))

            expect(
                screen.getByRole('dialog', { name: 'Import Zendesk data' }),
            ).toBeInTheDocument()

            await user.click(screen.getByRole('button', { name: 'Cancel' }))

            expect(
                screen.queryByRole('dialog', { name: 'Import Zendesk data' }),
            ).not.toBeInTheDocument()
        })

        it('should be able to reopen Zendesk modal after closing it', async () => {
            const user = userEvent.setup()
            renderComponent()

            await user.click(
                screen.getByRole('tab', { name: 'Zendesk Import' }),
            )

            await user.click(screen.getByText('Open Create Import Modal'))
            expect(
                screen.getByRole('dialog', { name: 'Import Zendesk data' }),
            ).toBeInTheDocument()

            await user.click(screen.getByRole('button', { name: 'Cancel' }))
            expect(
                screen.queryByRole('dialog', { name: 'Import Zendesk data' }),
            ).not.toBeInTheDocument()

            await user.click(screen.getByText('Open Create Import Modal'))
            expect(
                screen.getByRole('dialog', { name: 'Import Zendesk data' }),
            ).toBeInTheDocument()
        })
    })
})
