import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryHistory } from 'history'
import { Router } from 'react-router-dom'

import ImportEmail from './Import'

// Polyfill for getAnimations which is not available in JSDOM
Element.prototype.getAnimations = jest.fn().mockReturnValue([])

// Mock feature flags
jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))

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

const mockUseFlag = jest.mocked(require('@repo/feature-flags').useFlag)

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
        mockUseFlag.mockReturnValue(true)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    const renderComponent = (initialPath = '/import-email') => {
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
            renderComponent('/import-email?selectedEmail=test@example.com')

            expect(screen.getByTestId('selected-email')).toHaveTextContent(
                'test@example.com',
            )
        })

        it('should handle null selectedEmail when no query parameter is present', () => {
            renderComponent('/import-email')

            expect(
                screen.queryByTestId('create-import-modal'),
            ).not.toBeInTheDocument()
        })

        it('should handle empty selectedEmail parameter', () => {
            renderComponent('/import-email?selectedEmail=')

            expect(
                screen.queryByTestId('create-import-modal'),
            ).not.toBeInTheDocument()
        })

        it('should handle URL encoded email addresses', () => {
            renderComponent('/import-email?selectedEmail=test%40example.com')

            expect(screen.getByTestId('selected-email')).toHaveTextContent(
                'test@example.com',
            )
        })

        it('should handle multiple query parameters', () => {
            renderComponent(
                '/import-email?selectedEmail=test@example.com&other=value',
            )

            expect(screen.getByTestId('selected-email')).toHaveTextContent(
                'test@example.com',
            )
        })
    })

    describe('Active tab query parameter', () => {
        beforeEach(() => {
            mockUseFlag.mockReturnValue(true)
        })

        it('should default to Email Import tab when no activeTab query param is present', async () => {
            const { history } = renderComponent('/import-email')

            expect(screen.getByTestId('table-import-email')).toBeInTheDocument()

            await waitFor(() => {
                expect(history.location.search).toContain(
                    'activeTab=import-email',
                )
            })
        })

        it('should open Email Import tab when activeTab=import-email', async () => {
            const { history } = renderComponent(
                '/import-email?activeTab=import-email',
            )

            expect(screen.getByTestId('table-import-email')).toBeInTheDocument()
            expect(history.location.search).toContain('activeTab=import-email')
        })

        it('should open Zendesk Import tab when activeTab=import-zendesk', async () => {
            const { history } = renderComponent(
                '/import-email?activeTab=import-zendesk',
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
            const { history } = renderComponent('/import-email')

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
                '/import-email?activeTab=import-zendesk',
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
                '/import-email?selectedEmail=test@example.com&other=value',
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
                '/import-email?activeTab=invalid',
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
            renderComponent('/import-email?selectedEmail=test@example.com')

            expect(
                screen.getByTestId('create-import-modal'),
            ).toBeInTheDocument()
            expect(screen.getByTestId('modal-open')).toHaveTextContent('true')
        })

        it('should not auto-open modal when selectedEmail is null', () => {
            renderComponent('/import-email')

            expect(
                screen.queryByTestId('create-import-modal'),
            ).not.toBeInTheDocument()
        })

        it('should not auto-open modal when selectedEmail is empty string', () => {
            renderComponent('/import-email?selectedEmail=')

            expect(
                screen.queryByTestId('create-import-modal'),
            ).not.toBeInTheDocument()
        })

        it('should auto-open modal for any non-empty selectedEmail value', () => {
            renderComponent('/import-email?selectedEmail=any-value')

            expect(
                screen.getByTestId('create-import-modal'),
            ).toBeInTheDocument()
            expect(screen.getByTestId('modal-open')).toHaveTextContent('true')
        })
    })

    describe('Modal interactions', () => {
        it('should open modal when header button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent('/import-email')

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
            renderComponent('/import-email')

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
            renderComponent('/import-email?selectedEmail=test@example.com')

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
            renderComponent('/import-email?selectedEmail=test@example.com')

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
            renderComponent('/import-email?selectedEmail=test@gmail.com')

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
            renderComponent('/import-email?selectedEmail=%')

            // Should not crash and should render the component
            expect(
                screen.getByTestId('header-import-email'),
            ).toBeInTheDocument()
        })

        it('should handle special characters in selectedEmail', () => {
            const specialEmail = 'test+tag@example-domain.co.uk'
            renderComponent(
                `/import-email?selectedEmail=${encodeURIComponent(specialEmail)}`,
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
                '/app/settings/import-email?selectedEmail=test@example.com',
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

    describe('Feature flag behavior', () => {
        it('should show Zendesk Import tab when feature flag is enabled', () => {
            mockUseFlag.mockReturnValue(true)

            renderComponent()

            expect(
                screen.getByRole('tab', { name: 'Zendesk Import' }),
            ).toBeInTheDocument()
        })

        it('should hide Zendesk Import tab when feature flag is disabled', () => {
            mockUseFlag.mockReturnValue(false)

            renderComponent()

            expect(
                screen.queryByRole('tab', { name: 'Zendesk Import' }),
            ).not.toBeInTheDocument()
        })

        it('should render Zendesk Import tab when feature flag is enabled', () => {
            mockUseFlag.mockReturnValue(true)

            renderComponent()

            expect(
                screen.getByRole('tab', { name: 'Zendesk Import' }),
            ).toBeInTheDocument()
        })

        it('should not render Zendesk Import tab or table when feature flag is disabled', () => {
            mockUseFlag.mockReturnValue(false)

            const { container } = renderComponent()

            expect(
                screen.queryByRole('tab', { name: 'Zendesk Import' }),
            ).not.toBeInTheDocument()

            const zendeskTable = container.querySelector(
                '[data-testid="zendesk-import-table"]',
            )
            expect(zendeskTable).not.toBeInTheDocument()
        })

        it('should always show Email Import tab regardless of feature flag', () => {
            mockUseFlag.mockReturnValue(false)

            renderComponent()

            expect(
                screen.getByRole('tab', { name: 'Email Import' }),
            ).toBeInTheDocument()
            expect(screen.getByTestId('table-import-email')).toBeInTheDocument()
        })
    })

    describe('Zendesk Import modal interactions', () => {
        beforeEach(() => {
            mockUseFlag.mockReturnValue(true)
        })

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
