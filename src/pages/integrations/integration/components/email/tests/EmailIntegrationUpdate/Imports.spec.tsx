import React from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { MemoryRouter } from 'react-router-dom'

import Imports from 'pages/integrations/integration/components/email/EmailIntegrationUpdate/Imports'

jest.mock('hooks/useAppDispatch', () => {
    return () => jest.fn()
})

const defaultProps = {
    importActivated: false,
    status: '',
    mailsImported: 0,
    importDescription: (
        <span>
            the last <b>2</b> years of emails
        </span>
    ),
    importMethod: jest.fn(),
    integration: fromJS({
        id: 123,
        meta: {
            address: 'support@example.com',
        },
    }),
    loading: fromJS({}),
}

const renderImports = (props = {}) => {
    return render(
        <MemoryRouter>
            <Imports {...defaultProps} {...props} />
        </MemoryRouter>,
    )
}

describe('Imports', () => {
    let consoleSpy: jest.SpyInstance

    beforeEach(() => {
        jest.clearAllMocks()
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        consoleSpy.mockRestore()
    })

    describe('when import is not activated', () => {
        it('renders import description with email address', () => {
            renderImports()

            expect(screen.getByText('support@example.com')).toBeInTheDocument()
            expect(screen.getByText('2')).toBeInTheDocument()
        })

        it('renders import emails button', () => {
            renderImports()

            expect(
                screen.getByRole('button', { name: 'Import emails' }),
            ).toBeInTheDocument()
        })

        it('calls importMethod when import button is confirmed', async () => {
            const user = userEvent.setup()
            const mockImportMethod = jest.fn().mockResolvedValue(undefined)

            renderImports({ importMethod: mockImportMethod })

            const importButton = screen.getByRole('button', {
                name: 'Import emails',
            })
            await user.click(importButton)

            const confirmButton = screen.getByRole('button', {
                name: /confirm/i,
            })
            await user.click(confirmButton)

            await waitFor(() => {
                expect(mockImportMethod).toHaveBeenCalledTimes(1)
            })
        })

        it('shows loading state on button when loading', () => {
            const loadingProps = {
                loading: fromJS({ import: 123 }),
            }

            renderImports(loadingProps)

            const importButton = screen.getByRole('button', {
                name: /Loading.*Import emails/,
            })
            expect(importButton).toHaveAttribute('aria-disabled', 'true')
        })

        it('does not show spinner when not importing', () => {
            renderImports()

            expect(screen.queryByText('autorenew')).not.toBeInTheDocument()
        })

        it('does not show completion status when not activated', () => {
            renderImports({ mailsImported: 100 })

            expect(screen.queryByText('Completed:')).not.toBeInTheDocument()
        })
    })

    describe('when import is activated and in progress', () => {
        const importingProps = {
            importActivated: true,
            status: 'started',
        }

        it('shows importing status with email address', () => {
            renderImports(importingProps)

            expect(
                screen.getByText((content) =>
                    content.includes('We are currently importing emails from'),
                ),
            ).toBeInTheDocument()
            expect(screen.getByText('support@example.com')).toBeInTheDocument()
            expect(
                screen.getByText((content) => content.includes('into Gorgias')),
            ).toBeInTheDocument()
        })

        it('shows link to all tickets', () => {
            renderImports(importingProps)

            const ticketsLink = screen.getByText('All tickets')
            expect(ticketsLink).toBeInTheDocument()
        })

        it('shows spinner when importing', () => {
            renderImports(importingProps)

            expect(screen.getByText('autorenew')).toBeInTheDocument()
        })

        it('does not show import button when importing', () => {
            renderImports(importingProps)

            expect(
                screen.queryByRole('button', { name: /Import emails/ }),
            ).not.toBeInTheDocument()
        })

        it('shows importing status when activated but no status yet', () => {
            renderImports({
                importActivated: true,
                status: '',
            })

            expect(
                screen.getByText((content) =>
                    content.includes('We are currently importing emails from'),
                ),
            ).toBeInTheDocument()
            expect(screen.getByText('support@example.com')).toBeInTheDocument()
            expect(screen.getByText('autorenew')).toBeInTheDocument()
        })
    })

    describe('when import is completed', () => {
        const completedProps = {
            importActivated: true,
            status: 'completed',
            mailsImported: 150,
        }

        it('shows completion status with imported count', () => {
            renderImports(completedProps)

            expect(screen.getByText('150')).toBeInTheDocument()
        })

        it('does not show spinner when completed', () => {
            renderImports(completedProps)

            expect(screen.queryByText('autorenew')).not.toBeInTheDocument()
        })

        it('does not show import button when completed', () => {
            renderImports(completedProps)

            expect(
                screen.queryByRole('button', { name: /Import emails/ }),
            ).not.toBeInTheDocument()
        })

        it('does not show importing status when completed', () => {
            renderImports(completedProps)

            expect(
                screen.queryByText('We are currently importing'),
            ).not.toBeInTheDocument()
        })
    })

    describe('with different email addresses', () => {
        it('displays the correct email address from integration', () => {
            const customProps = {
                integration: fromJS({
                    id: 456,
                    meta: {
                        address: 'hello@customdomain.com',
                    },
                }),
            }

            renderImports(customProps)

            expect(
                screen.getByText('hello@customdomain.com'),
            ).toBeInTheDocument()
        })
    })

    describe('with custom import description', () => {
        it('renders custom import description', () => {
            const customDescription = (
                <span>
                    custom <em>import</em> description
                </span>
            )

            renderImports({ importDescription: customDescription })

            expect(screen.getByText('import')).toBeInTheDocument()
            expect(screen.getByText('support@example.com')).toBeInTheDocument()
        })
    })
})
