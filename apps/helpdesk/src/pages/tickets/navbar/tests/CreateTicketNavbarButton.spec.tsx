import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useCreateTicketButton } from 'pages/common/components/CreateTicket/useCreateTicketButton'
import { userEvent } from 'utils/testing/userEvent'

import { CreateTicketNavbarButton } from '../CreateTicketNavbarButton'

jest.mock('react-router-dom', () => {
    const actual = jest.requireActual('react-router-dom')
    return {
        ...actual,
        useLocation: jest.fn(),
    }
})

jest.mock('pages/common/components/CreateTicket/useCreateTicketButton', () => ({
    useCreateTicketButton: jest.fn(),
}))

const mockedUseCreateTicketButton = jest.mocked(useCreateTicketButton)

const renderComponent = (initialPath = '/') => {
    return render(
        <MemoryRouter initialEntries={[initialPath]}>
            <Route path="*" component={CreateTicketNavbarButton} />
        </MemoryRouter>,
    )
}

describe('<CreateTicketNavbarButton />', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        // Default mock return values
        jest.mocked(require('react-router-dom').useLocation).mockReturnValue({
            pathname: '/',
        })
        // Configure the mock using the typed reference
        mockedUseCreateTicketButton.mockReturnValue({
            hasDraft: false,
            onResumeDraft: jest.fn(),
            onDiscardDraft: jest.fn(),
            createTicketActions: { CREATE_TICKET: { action: jest.fn() } },
            createTicketPath: '/ticket/new',
        })
    })

    it('should render a link to create ticket when no draft exists', () => {
        renderComponent()

        const link = screen.getByRole('link', { name: /create ticket/i })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/ticket/new')
    })

    it('should render a button and dropdown when a draft exists', async () => {
        const onResumeDraftMock = jest.fn()
        const onDiscardDraftMock = jest.fn()
        // Configure the mock using the typed reference
        mockedUseCreateTicketButton.mockReturnValue({
            hasDraft: true,
            onResumeDraft: onResumeDraftMock,
            onDiscardDraft: onDiscardDraftMock,
            createTicketActions: { CREATE_TICKET: { action: jest.fn() } },
            createTicketPath: '/ticket/new',
        })

        renderComponent()

        const button = screen.getByRole('button', { name: /create ticket/i })
        expect(button).toBeInTheDocument()
        expect(
            screen.queryByRole('link', { name: /create ticket/i }),
        ).not.toBeInTheDocument()

        await userEvent.click(button)

        const resumeOption = screen.getByRole('option', {
            name: /resume draft/i,
        })
        const discardOption = screen.getByRole('option', {
            name: /discard and create new ticket/i,
        })

        expect(resumeOption).toBeInTheDocument()
        expect(discardOption).toBeInTheDocument()

        await userEvent.click(resumeOption)
        expect(onResumeDraftMock).toHaveBeenCalledTimes(1)

        await userEvent.click(button)
        const discardOptionAgain = screen.getByRole('option', {
            name: /discard and create new ticket/i,
        })
        await userEvent.click(discardOptionAgain)
        expect(onDiscardDraftMock).toHaveBeenCalledTimes(1)
        expect(onDiscardDraftMock).toHaveBeenCalledWith('/ticket/new')
    })

    it('should render a disabled button when on the new ticket page and a draft exists', async () => {
        // Configure the mock using the typed reference
        mockedUseCreateTicketButton.mockReturnValue({
            hasDraft: true,
            onResumeDraft: jest.fn(),
            onDiscardDraft: jest.fn(),
            createTicketActions: { CREATE_TICKET: { action: jest.fn() } },
            createTicketPath: '/ticket/new',
        })
        jest.mocked(require('react-router-dom').useLocation).mockReturnValue({
            pathname: '/ticket/new',
        })

        renderComponent('/ticket/new')

        const button = screen.getByRole('button', { name: /create ticket/i })
        expect(button).toBeInTheDocument()
        expect(button).toBeDisabled()

        // Try to click the disabled button
        await userEvent.click(button)

        // Verify dropdown does not open
        expect(
            screen.queryByRole('menuitem', { name: /resume draft/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('menuitem', {
                name: /discard and create new ticket/i,
            }),
        ).not.toBeInTheDocument()
    })
})
