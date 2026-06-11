import { SidebarProvider } from '@repo/navigation'
import { assumeMock, render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { useSidebarCreateButtonsFlag } from '@repo/feature-flags'

import { useCreateTicketButton } from 'pages/common/components/CreateTicket/useCreateTicketButton'

import { TicketNavbarCreateMenu } from '../TicketNavbarCreateMenu'
import { usePlaceCallButton } from '../usePlaceCallButton'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useSidebarCreateButtonsFlag: jest.fn().mockReturnValue(false),
}))

jest.mock('pages/common/components/CreateTicket/useCreateTicketButton')
jest.mock('../usePlaceCallButton')

jest.mock('@repo/navigation', () => ({
    ...jest.requireActual('@repo/navigation'),
    useSidebar: jest.fn().mockReturnValue({ isCollapsed: false }),
    useSidebarButtonSize: jest.fn().mockReturnValue('sm'),
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

jest.mock(
    'pages/integrations/integration/components/phone/PhoneDevice',
    () => ({
        __esModule: true,
        PhoneDevice: () => null,
    }),
)

jest.mock('business/twilio', () => ({
    DEFAULT_ERROR_MESSAGE: 'Device not ready',
    MICROPHONE_PERMISSION_ERROR_MESSAGE: 'Microphone permission denied',
}))

const useCreateTicketButtonMock = assumeMock(useCreateTicketButton)
const usePlaceCallButtonMock = assumeMock(usePlaceCallButton)
const useSidebarCreateButtonsFlagMock = assumeMock(useSidebarCreateButtonsFlag)

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
    hasPhone: false,
}

const renderComponent = (initialEntries = ['/']) => {
    const user = userEvent.setup()
    const result = render(
        <MemoryRouter initialEntries={initialEntries}>
            <TicketNavbarCreateMenu />
        </MemoryRouter>,
        { wrapper: SidebarProvider },
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
        useSidebarCreateButtonsFlagMock.mockReturnValue(false)
        jest.requireMock('@repo/navigation').useSidebar.mockReturnValue({
            isCollapsed: false,
        })
    })

    it('renders "Create ticket" button when sidebar is not collapsed and user has no phone', () => {
        renderComponent()

        expect(screen.getByText('Create ticket')).toBeInTheDocument()
    })

    it('renders "Create" button text when sidebar is not collapsed and user has a phone', () => {
        usePlaceCallButtonMock.mockReturnValue({
            ...defaultPlaceCallButton,
            hasPhone: true,
        })

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

    it('renders icon-only button without "Create" text when sidebar is collapsed and user has a phone', () => {
        jest.requireMock('@repo/navigation').useSidebar.mockReturnValue({
            isCollapsed: true,
        })
        usePlaceCallButtonMock.mockReturnValue({
            ...defaultPlaceCallButton,
            hasPhone: true,
        })

        renderComponent()

        expect(screen.queryByText('Create')).not.toBeInTheDocument()
        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('renders icon-only button without "Create" text when sidebar is collapsed and user has a draft', () => {
        jest.requireMock('@repo/navigation').useSidebar.mockReturnValue({
            isCollapsed: true,
        })
        useCreateTicketButtonMock.mockReturnValue({
            ...defaultCreateTicketButton,
            hasDraft: true,
        } as unknown as ReturnType<typeof useCreateTicketButton>)

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

    it('renders "Create ticket" menu item when there is no draft but user has a phone', async () => {
        usePlaceCallButtonMock.mockReturnValue({
            ...defaultPlaceCallButton,
            hasPhone: true,
        })

        const { user } = renderComponent()

        await user.click(screen.getByText('Create'))

        await waitFor(() => {
            expect(screen.getByText('Create ticket')).toBeInTheDocument()
        })
    })

    it('renders "Place call" menu item when shouldDisplayButton is true', async () => {
        usePlaceCallButtonMock.mockReturnValue({
            ...defaultPlaceCallButton,
            hasPhone: true,
            shouldDisplayButton: true,
        })

        const { user } = renderComponent()

        await user.click(screen.getByText('Create'))

        await waitFor(() => {
            expect(screen.getByText('Place call')).toBeInTheDocument()
        })
    })

    it('does not render "Place call" when shouldDisplayButton is false but user has a phone', async () => {
        usePlaceCallButtonMock.mockReturnValue({
            ...defaultPlaceCallButton,
            hasPhone: true,
            shouldDisplayButton: false,
        })

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
            hasPhone: true,
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

    it('calls history.push when "Create ticket" menu item is clicked', async () => {
        const { history } = jest.requireMock('@repo/routing')

        usePlaceCallButtonMock.mockReturnValue({
            ...defaultPlaceCallButton,
            hasPhone: true,
        })

        const { user } = renderComponent()

        await user.click(screen.getByText('Create'))

        await waitFor(() => {
            expect(screen.getByText('Create ticket')).toBeInTheDocument()
        })

        await user.click(screen.getByText('Create ticket'))

        expect(history.push).toHaveBeenCalledWith('/ticket/new')
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
            hasPhone: true,
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
            hasPhone: true,
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
            hasPhone: true,
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
            hasPhone: true,
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

    it('calls history.push when "Create ticket" button is clicked directly (no phone, no draft)', async () => {
        const { history } = jest.requireMock('@repo/routing')

        const { user } = renderComponent()

        await user.click(screen.getByText('Create ticket'))

        expect(history.push).toHaveBeenCalledWith('/ticket/new')
    })

    it('disables "Create ticket" button when pathname includes /ticket/new (no phone, no draft)', () => {
        renderComponent(['/ticket/new'])

        expect(
            screen.getByText('Create ticket').closest('[aria-disabled]'),
        ).toHaveAttribute('aria-disabled', 'true')
    })
})

describe('TicketNavbarCreateMenu with SidebarCreateButtons feature flag enabled', () => {
    beforeEach(() => {
        mockIsMacOs = false
        useCreateTicketButtonMock.mockReturnValue(
            defaultCreateTicketButton as unknown as ReturnType<
                typeof useCreateTicketButton
            >,
        )
        usePlaceCallButtonMock.mockReturnValue(defaultPlaceCallButton)
        useSidebarCreateButtonsFlagMock.mockReturnValue(true)
        jest.requireMock('@repo/navigation').useSidebar.mockReturnValue({
            isCollapsed: false,
        })
    })

    it('renders "New ticket" button with shortcut key when there is no draft and no phone', () => {
        renderComponent()

        expect(screen.getByText('New ticket')).toBeInTheDocument()
        expect(screen.getByText('N')).toBeInTheDocument()
    })

    it('does not render a "Call" button when shouldDisplayButton is false', () => {
        renderComponent()

        expect(screen.queryByText('Call')).not.toBeInTheDocument()
    })

    it('renders "New ticket" and "Call" buttons when shouldDisplayPlaceCall is true', () => {
        usePlaceCallButtonMock.mockReturnValue({
            ...defaultPlaceCallButton,
            shouldDisplayButton: true,
        })

        renderComponent()

        expect(screen.getByText('New ticket')).toBeInTheDocument()
        expect(screen.getByText('Call')).toBeInTheDocument()
    })

    it('renders "Resume draft" and discard button when hasDraft is true', () => {
        useCreateTicketButtonMock.mockReturnValue({
            ...defaultCreateTicketButton,
            hasDraft: true,
        } as unknown as ReturnType<typeof useCreateTicketButton>)

        renderComponent()

        expect(screen.getByText('Resume draft')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Discard draft' }),
        ).toBeInTheDocument()
    })

    it('does not render "New ticket" when hasDraft is true', () => {
        useCreateTicketButtonMock.mockReturnValue({
            ...defaultCreateTicketButton,
            hasDraft: true,
        } as unknown as ReturnType<typeof useCreateTicketButton>)

        renderComponent()

        expect(screen.queryByText('New ticket')).not.toBeInTheDocument()
    })

    it('calls onResumeDraft when "Resume draft" button is clicked', async () => {
        const onResumeDraft = jest.fn()
        useCreateTicketButtonMock.mockReturnValue({
            ...defaultCreateTicketButton,
            hasDraft: true,
            onResumeDraft,
        } as unknown as ReturnType<typeof useCreateTicketButton>)

        const { user } = renderComponent()

        await user.click(screen.getByText('Resume draft'))

        expect(onResumeDraft).toHaveBeenCalledTimes(1)
    })

    it('calls onDiscardDraft with createTicketPath when the discard button is clicked', async () => {
        const onDiscardDraft = jest.fn()
        useCreateTicketButtonMock.mockReturnValue({
            ...defaultCreateTicketButton,
            hasDraft: true,
            onDiscardDraft,
            createTicketPath: '/ticket/new',
        } as unknown as ReturnType<typeof useCreateTicketButton>)

        const { user } = renderComponent()

        await user.click(screen.getByRole('button', { name: 'Discard draft' }))

        expect(onDiscardDraft).toHaveBeenCalledWith('/ticket/new')
    })

    it('disables "New ticket" button when pathname includes /ticket/new', () => {
        renderComponent(['/ticket/new'])

        expect(
            screen.getByText('New ticket').closest('[aria-disabled]'),
        ).toHaveAttribute('aria-disabled', 'true')
    })

    it('disables "Resume draft" and discard buttons when pathname includes /ticket/new', () => {
        useCreateTicketButtonMock.mockReturnValue({
            ...defaultCreateTicketButton,
            hasDraft: true,
        } as unknown as ReturnType<typeof useCreateTicketButton>)

        renderComponent(['/ticket/new'])

        expect(
            screen.getByText('Resume draft').closest('[aria-disabled]'),
        ).toHaveAttribute('aria-disabled', 'true')
        expect(
            screen.getByRole('button', { name: 'Discard draft' }),
        ).toHaveAttribute('aria-disabled', 'true')
    })

    it('renders icon-only button when sidebar is collapsed (not inline buttons)', () => {
        jest.requireMock('@repo/navigation').useSidebar.mockReturnValue({
            isCollapsed: true,
        })
        usePlaceCallButtonMock.mockReturnValue({
            ...defaultPlaceCallButton,
            hasPhone: true,
            shouldDisplayButton: true,
        })

        renderComponent()

        expect(screen.queryByText('New ticket')).not.toBeInTheDocument()
        expect(screen.queryByText('Call')).not.toBeInTheDocument()
    })

    it('shows macOS shortcut keys on the Call button when enabled on macOS', () => {
        mockIsMacOs = true
        usePlaceCallButtonMock.mockReturnValue({
            ...defaultPlaceCallButton,
            shouldDisplayButton: true,
            isButtonDisabled: false,
        })

        renderComponent()

        expect(screen.getByText('⌘')).toBeInTheDocument()
        expect(screen.getByText('E')).toBeInTheDocument()
    })

    it('shows ctrl shortcut key on the Call button when enabled on non-macOS', () => {
        mockIsMacOs = false
        usePlaceCallButtonMock.mockReturnValue({
            ...defaultPlaceCallButton,
            shouldDisplayButton: true,
            isButtonDisabled: false,
        })

        renderComponent()

        expect(screen.getByText('ctrl')).toBeInTheDocument()
        expect(screen.getByText('E')).toBeInTheDocument()
    })

    it('shows error icon on the Call button when device is disabled', () => {
        usePlaceCallButtonMock.mockReturnValue({
            ...defaultPlaceCallButton,
            shouldDisplayButton: true,
            isButtonDisabled: true,
            isDeviceActive: false,
        })

        renderComponent()

        expect(screen.queryByText('E')).not.toBeInTheDocument()
    })

    it('calls setIsDeviceVisible when Call button is clicked', async () => {
        const setIsDeviceVisible = jest.fn()
        usePlaceCallButtonMock.mockReturnValue({
            ...defaultPlaceCallButton,
            shouldDisplayButton: true,
            isButtonDisabled: false,
            setIsDeviceVisible,
        })

        const { user } = renderComponent()

        await user.click(screen.getByText('Call'))

        expect(setIsDeviceVisible).toHaveBeenCalledWith(true)
    })

    it('calls history.push when "New ticket" button is clicked', async () => {
        const { history } = jest.requireMock('@repo/routing')

        const { user } = renderComponent()

        await user.click(screen.getByText('New ticket'))

        expect(history.push).toHaveBeenCalledWith('/ticket/new')
    })
})
