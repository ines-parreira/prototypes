import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import ImportEmail from './Import'

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

jest.mock('./Modal/CreateImportModal', () => {
    return function MockCreateImportModal({
        selectedEmail,
        isOpen,
        onClose,
    }: any) {
        return (
            <div data-testid="create-import-modal">
                <div data-testid="modal-open">{isOpen ? 'true' : 'false'}</div>
                <div data-testid="selected-email">
                    {selectedEmail === null ? 'null' : selectedEmail}
                </div>
                <button onClick={onClose}>Close Modal</button>
            </div>
        )
    }
})

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

    const renderComponent = (initialEntries = ['/import-email']) => {
        return render(
            <MemoryRouter initialEntries={initialEntries}>
                <ImportEmail />
            </MemoryRouter>,
        )
    }

    describe('Component rendering', () => {
        it('should render all main components', () => {
            renderComponent()

            expect(
                screen.getByTestId('header-import-email'),
            ).toBeInTheDocument()
            expect(screen.getByTestId('table-import-email')).toBeInTheDocument()
            expect(
                screen.getByTestId('create-import-modal'),
            ).toBeInTheDocument()
        })

        it('should have correct container class', () => {
            const { container } = renderComponent()

            expect(container.firstChild).toHaveClass('full-width')
        })
    })

    describe('URL parameter parsing', () => {
        it('should extract selectedEmail from URL query parameters', () => {
            renderComponent(['/import-email?selectedEmail=test@example.com'])

            expect(screen.getByTestId('selected-email')).toHaveTextContent(
                'test@example.com',
            )
        })

        it('should handle null selectedEmail when no query parameter is present', () => {
            renderComponent(['/import-email'])

            expect(screen.getByTestId('selected-email')).toHaveTextContent(
                'null',
            )
        })

        it('should handle empty selectedEmail parameter', () => {
            renderComponent(['/import-email?selectedEmail='])

            expect(screen.getByTestId('selected-email')).toBeEmptyDOMElement()
        })

        it('should handle URL encoded email addresses', () => {
            renderComponent(['/import-email?selectedEmail=test%40example.com'])

            expect(screen.getByTestId('selected-email')).toHaveTextContent(
                'test@example.com',
            )
        })

        it('should handle multiple query parameters', () => {
            renderComponent([
                '/import-email?selectedEmail=test@example.com&other=value',
            ])

            expect(screen.getByTestId('selected-email')).toHaveTextContent(
                'test@example.com',
            )
        })
    })

    describe('Modal auto-opening behavior', () => {
        it('should auto-open modal when selectedEmail is present', () => {
            renderComponent(['/import-email?selectedEmail=test@example.com'])

            expect(screen.getByTestId('modal-open')).toHaveTextContent('true')
        })

        it('should not auto-open modal when selectedEmail is null', () => {
            renderComponent(['/import-email'])

            expect(screen.getByTestId('modal-open')).toHaveTextContent('false')
        })

        it('should not auto-open modal when selectedEmail is empty string', () => {
            renderComponent(['/import-email?selectedEmail='])

            expect(screen.getByTestId('modal-open')).toHaveTextContent('false')
        })

        it('should auto-open modal for any non-empty selectedEmail value', () => {
            renderComponent(['/import-email?selectedEmail=any-value'])

            expect(screen.getByTestId('modal-open')).toHaveTextContent('true')
        })
    })

    describe('Modal interactions', () => {
        it('should open modal when header button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent(['/import-email'])

            // Initially closed
            expect(screen.getByTestId('modal-open')).toHaveTextContent('false')

            // Click header button
            await user.click(screen.getByText('Open Create Import Modal'))

            // Should be open
            expect(screen.getByTestId('modal-open')).toHaveTextContent('true')
        })

        it('should open modal when table button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent(['/import-email'])

            // Initially closed
            expect(screen.getByTestId('modal-open')).toHaveTextContent('false')

            // Click table button
            await user.click(screen.getByText('Table Open Create Import Modal'))

            // Should be open
            expect(screen.getByTestId('modal-open')).toHaveTextContent('true')
        })

        it('should close modal when close button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent(['/import-email?selectedEmail=test@example.com'])

            // Initially open due to selectedEmail
            expect(screen.getByTestId('modal-open')).toHaveTextContent('true')

            // Click close button
            await user.click(screen.getByText('Close Modal'))

            // Should be closed
            expect(screen.getByTestId('modal-open')).toHaveTextContent('false')
        })

        it('should be able to open modal after closing it', async () => {
            const user = userEvent.setup()
            renderComponent(['/import-email?selectedEmail=test@example.com'])

            // Initially open
            expect(screen.getByTestId('modal-open')).toHaveTextContent('true')

            // Close modal
            await user.click(screen.getByText('Close Modal'))
            expect(screen.getByTestId('modal-open')).toHaveTextContent('false')

            // Open modal again via header
            await user.click(screen.getByText('Open Create Import Modal'))
            expect(screen.getByTestId('modal-open')).toHaveTextContent('true')
        })
    })

    describe('Props passing', () => {
        it('should pass selectedEmail to CreateImportModal', () => {
            renderComponent(['/import-email?selectedEmail=test@gmail.com'])

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
            renderComponent(['/import-email?selectedEmail=%'])

            // Should not crash and should render the component
            expect(
                screen.getByTestId('create-import-modal'),
            ).toBeInTheDocument()
        })

        it('should handle special characters in selectedEmail', () => {
            const specialEmail = 'test+tag@example-domain.co.uk'
            renderComponent([
                `/import-email?selectedEmail=${encodeURIComponent(specialEmail)}`,
            ])

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
            renderComponent([
                '/app/settings/import-email?selectedEmail=test@example.com',
            ])

            expect(screen.getByTestId('selected-email')).toHaveTextContent(
                'test@example.com',
            )
            expect(screen.getByTestId('modal-open')).toHaveTextContent('true')
        })
    })

    describe('Integration with useTableImport hook', () => {
        it('should call useTableImport hook', () => {
            renderComponent()

            expect(mockUseTableImport).toHaveBeenCalledTimes(1)
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
})
