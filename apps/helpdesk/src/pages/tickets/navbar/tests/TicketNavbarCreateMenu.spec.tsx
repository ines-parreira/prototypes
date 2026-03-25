import { assumeMock } from '@repo/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { useCreateTicketButton } from 'pages/common/components/CreateTicket/useCreateTicketButton'

import { TicketNavbarCreateMenu } from '../TicketNavbarCreateMenu'
import { usePlaceCallButton } from '../usePlaceCallButton'

jest.mock('pages/common/components/CreateTicket/useCreateTicketButton')
jest.mock('../usePlaceCallButton')

jest.mock('@repo/navigation', () => ({
    ...jest.requireActual('@repo/navigation'),
    useSidebar: jest.fn().mockReturnValue({ isCollapsed: false }),
}))

let mockIsMacOs = false

jest.mock('@repo/utils', () => ({
    ...jest.requireActual('@repo/utils'),
    get isMacOs() {
        return mockIsMacOs
    },
    useShortcuts: jest.fn(),
}))

jest.mock('@repo/routing', () => ({
    history: { push: jest.fn() },
}))

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: { CreateTicketButtonClicked: 'create_ticket_button_clicked' },
}))

jest.mock(
    'pages/integrations/integration/components/phone/PhoneDevice',
    () => ({
        __esModule: true,
        default: () => null,
    }),
)

jest.mock('business/twilio', () => ({
    DEFAULT_ERROR_MESSAGE: 'Device not ready',
    MICROPHONE_PERMISSION_ERROR_MESSAGE: 'Microphone permission denied',
}))

const useCreateTicketButtonMock = assumeMock(useCreateTicketButton)
const usePlaceCallButtonMock = assumeMock(usePlaceCallButton)

const defaultCreateTicketButton = {
    hasDraft: false,
    onResumeDraft: jest.fn(),
    onDiscardDraft: jest.fn(),
    createTicketActions: {},
    createTicketPath: '/ticket/new',
}

const defaultPlaceCallButton = {
    isDeviceVisible: false,
    setIsDeviceVisible: jest.fn(),
    shouldDisplayButton: false,
    isDeviceActive: true,
    isButtonDisabled: false,
}

const renderComponent = (initialEntries = ['/']) => {
    const user = userEvent.setup()
    const result = render(
        <MemoryRouter initialEntries={initialEntries}>
            <TicketNavbarCreateMenu />
        </MemoryRouter>,
    )
    return { ...result, user }
}

describe('TicketNavbarCreateMenu', () => {
    beforeEach(() => {
        mockIsMacOs = false
        useCreateTicketButtonMock.mockReturnValue(
            defaultCreateTicketButton as unknown as ReturnType<
                typeof useCreateTicketButton
            >,
        )
        usePlaceCallButtonMock.mockReturnValue(defaultPlaceCallButton)
        jest.requireMock('@repo/navigation').useSidebar.mockReturnValue({
            isCollapsed: false,
        })
    })

    it('renders "Create" button text when sidebar is not collapsed', () => {
        renderComponent()

        expect(screen.getByText('Create')).toBeInTheDocument()
    })

    it('renders icon-only button when sidebar is collapsed', () => {
        jest.requireMock('@repo/navigation').useSidebar.mockReturnValue({
            isCollapsed: true,
        })

        renderComponent()

        expect(screen.queryByText('Create')).not.toBeInTheDocument()
        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('renders "Resume draft" and "Discard and create new" menu items when hasDraft is true', async () => {
        useCreateTicketButtonMock.mockReturnValue({
            ...defaultCreateTicketButton,
            hasDraft: true,
        } as unknown as ReturnType<typeof useCreateTicketButton>)

        const { user } = renderComponent()

        await user.click(screen.getByText('Create'))

        await waitFor(() => {
            expect(screen.getByText('Resume draft')).toBeInTheDocument()
            expect(
                screen.getByText('Discard and create new ticket'),
            ).toBeInTheDocument()
        })
    })

    it('renders "Create ticket" menu item when there is no draft', async () => {
        const { user } = renderComponent()

        await user.click(screen.getByText('Create'))

        await waitFor(() => {
            expect(screen.getByText('Create ticket')).toBeInTheDocument()
        })
    })

    it('renders "Place call" menu item when shouldDisplayButton is true', async () => {
        usePlaceCallButtonMock.mockReturnValue({
            ...defaultPlaceCallButton,
            shouldDisplayButton: true,
        })

        const { user } = renderComponent()

        await user.click(screen.getByText('Create'))

        await waitFor(() => {
            expect(screen.getByText('Place call')).toBeInTheDocument()
        })
    })

    it('does not render "Place call" when shouldDisplayButton is false', async () => {
        const { user } = renderComponent()

        await user.click(screen.getByText('Create'))

        await waitFor(() => {
            expect(screen.getByText('Create ticket')).toBeInTheDocument()
        })

        expect(screen.queryByText('Place call')).not.toBeInTheDocument()
    })

    it('calls setIsDeviceVisible when Place call is clicked', async () => {
        const setIsDeviceVisible = jest.fn()
        usePlaceCallButtonMock.mockReturnValue({
            ...defaultPlaceCallButton,
            shouldDisplayButton: true,
            setIsDeviceVisible,
        })

        const { user } = renderComponent()

        await user.click(screen.getByText('Create'))

        await waitFor(() => {
            expect(screen.getByText('Place call')).toBeInTheDocument()
        })

        await user.click(screen.getByText('Place call'))

        expect(setIsDeviceVisible).toHaveBeenCalledWith(true)
    })

    it('calls history.push and logEvent when "Create ticket" menu item is clicked', async () => {
        const { history } = jest.requireMock('@repo/routing')
        const { logEvent, SegmentEvent } = jest.requireMock('@repo/logging')

        const { user } = renderComponent()

        await user.click(screen.getByText('Create'))

        await waitFor(() => {
            expect(screen.getByText('Create ticket')).toBeInTheDocument()
        })

        await user.click(screen.getByText('Create ticket'))

        expect(history.push).toHaveBeenCalledWith('/ticket/new')
        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.CreateTicketButtonClicked,
        )
    })

    it('calls onResumeDraft when "Resume draft" is clicked', async () => {
        const onResumeDraft = jest.fn()
        useCreateTicketButtonMock.mockReturnValue({
            ...defaultCreateTicketButton,
            hasDraft: true,
            onResumeDraft,
        } as unknown as ReturnType<typeof useCreateTicketButton>)

        const { user } = renderComponent()

        await user.click(screen.getByText('Create'))

        await waitFor(() => {
            expect(screen.getByText('Resume draft')).toBeInTheDocument()
        })

        await user.click(screen.getByText('Resume draft'))

        expect(onResumeDraft).toHaveBeenCalledTimes(1)
    })

    it('calls onDiscardDraft with createTicketPath when "Discard and create new ticket" is clicked', async () => {
        const onDiscardDraft = jest.fn()
        useCreateTicketButtonMock.mockReturnValue({
            ...defaultCreateTicketButton,
            hasDraft: true,
            onDiscardDraft,
        } as unknown as ReturnType<typeof useCreateTicketButton>)

        const { user } = renderComponent()

        await user.click(screen.getByText('Create'))

        await waitFor(() => {
            expect(
                screen.getByText('Discard and create new ticket'),
            ).toBeInTheDocument()
        })

        await user.click(screen.getByText('Discard and create new ticket'))

        expect(onDiscardDraft).toHaveBeenCalledWith('/ticket/new')
    })

    it('disables draft menu items when pathname includes /ticket/new', async () => {
        useCreateTicketButtonMock.mockReturnValue({
            ...defaultCreateTicketButton,
            hasDraft: true,
        } as unknown as ReturnType<typeof useCreateTicketButton>)

        const { user } = renderComponent(['/ticket/new'])

        await user.click(screen.getByText('Create'))

        await waitFor(() => {
            expect(screen.getByText('Resume draft')).toBeInTheDocument()
        })

        expect(
            screen.getByText('Resume draft').closest('[aria-disabled]'),
        ).toHaveAttribute('aria-disabled', 'true')
        expect(
            screen
                .getByText('Discard and create new ticket')
                .closest('[aria-disabled]'),
        ).toHaveAttribute('aria-disabled', 'true')
    })

    it('disables Place call and shows no shortcut keys when device is not active', async () => {
        usePlaceCallButtonMock.mockReturnValue({
            ...defaultPlaceCallButton,
            shouldDisplayButton: true,
            isButtonDisabled: true,
            isDeviceActive: false,
        })

        const { user } = renderComponent()

        await user.click(screen.getByText('Create'))

        await waitFor(() => {
            expect(screen.getByText('Place call')).toBeInTheDocument()
        })

        expect(
            screen.getByText('Place call').closest('[data-disabled]'),
        ).toHaveAttribute('data-disabled', 'true')
        expect(screen.queryByText('E')).not.toBeInTheDocument()
    })

    it('disables Place call and shows no shortcut keys when microphone permission is denied', async () => {
        usePlaceCallButtonMock.mockReturnValue({
            ...defaultPlaceCallButton,
            shouldDisplayButton: true,
            isButtonDisabled: true,
            isDeviceActive: true,
        })

        const { user } = renderComponent()

        await user.click(screen.getByText('Create'))

        await waitFor(() => {
            expect(screen.getByText('Place call')).toBeInTheDocument()
        })

        expect(
            screen.getByText('Place call').closest('[data-disabled]'),
        ).toHaveAttribute('data-disabled', 'true')
        expect(screen.queryByText('E')).not.toBeInTheDocument()
    })

    it('shows macOS shortcut keys when Place call is enabled on macOS', async () => {
        mockIsMacOs = true
        usePlaceCallButtonMock.mockReturnValue({
            ...defaultPlaceCallButton,
            shouldDisplayButton: true,
            isButtonDisabled: false,
        })

        const { user } = renderComponent()

        await user.click(screen.getByText('Create'))

        await waitFor(() => {
            expect(screen.getByText('Place call')).toBeInTheDocument()
        })

        expect(screen.getByText('⌘')).toBeInTheDocument()
        expect(screen.getByText('E')).toBeInTheDocument()
    })

    it('shows ctrl shortcut key when Place call is enabled on non-macOS', async () => {
        mockIsMacOs = false
        usePlaceCallButtonMock.mockReturnValue({
            ...defaultPlaceCallButton,
            shouldDisplayButton: true,
            isButtonDisabled: false,
        })

        const { user } = renderComponent()

        await user.click(screen.getByText('Create'))

        await waitFor(() => {
            expect(screen.getByText('Place call')).toBeInTheDocument()
        })

        expect(screen.getByText('ctrl')).toBeInTheDocument()
        expect(screen.getByText('E')).toBeInTheDocument()
    })
})
