import { SidebarProvider } from '@repo/navigation'
import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'
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

    it('renders icon-only button when sidebar is collapsed', () => {
        jest.requireMock('@repo/navigation').useSidebar.mockReturnValue({
            isCollapsed: true,
        })

        renderComponent()

        expect(screen.queryByText('New ticket')).not.toBeInTheDocument()
        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('renders icon-only button when sidebar is collapsed and user has a phone', () => {
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

    it('renders icon-only button when sidebar is collapsed and user has a draft', () => {
        jest.requireMock('@repo/navigation').useSidebar.mockReturnValue({
            isCollapsed: true,
        })
        useCreateTicketButtonMock.mockReturnValue({
            ...defaultCreateTicketButton,
            hasDraft: true,
        } as unknown as ReturnType<typeof useCreateTicketButton>)

        renderComponent()

        expect(screen.queryByText('New ticket')).not.toBeInTheDocument()
        expect(screen.getByRole('button')).toBeInTheDocument()
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

    it('shows device error message on disabled "Call" button when device is not active', async () => {
        usePlaceCallButtonMock.mockReturnValue({
            ...defaultPlaceCallButton,
            shouldDisplayButton: true,
            isButtonDisabled: true,
            isDeviceActive: false,
        })

        const { user } = renderComponent()

        await user.hover(screen.getByText('Call'))

        expect(await screen.findByText('Device not ready')).toBeInTheDocument()
    })

    it('shows microphone permission error message on disabled "Call" button when microphone is denied', async () => {
        usePlaceCallButtonMock.mockReturnValue({
            ...defaultPlaceCallButton,
            shouldDisplayButton: true,
            isButtonDisabled: true,
            isDeviceActive: true,
        })

        const { user } = renderComponent()

        await user.hover(screen.getByText('Call'))

        expect(
            await screen.findByText('Microphone permission denied'),
        ).toBeInTheDocument()
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

    it('calls history.push when the icon button is clicked in collapsed state with no phone and no draft', async () => {
        jest.requireMock('@repo/navigation').useSidebar.mockReturnValue({
            isCollapsed: true,
        })
        const { history } = jest.requireMock('@repo/routing')
        const { user } = renderComponent()

        await user.click(screen.getByRole('button'))

        expect(history.push).toHaveBeenCalledWith('/ticket/new')
    })

    describe('collapsed sidebar menu', () => {
        beforeEach(() => {
            jest.requireMock('@repo/navigation').useSidebar.mockReturnValue({
                isCollapsed: true,
            })
        })

        it('calls history.push when "Create ticket" menu item is clicked', async () => {
            usePlaceCallButtonMock.mockReturnValue({
                ...defaultPlaceCallButton,
                hasPhone: true,
            })
            const { history } = jest.requireMock('@repo/routing')
            const { user } = renderComponent()

            await user.click(screen.getByRole('button'))

            await user.click(await screen.findByText('Create ticket'))

            expect(history.push).toHaveBeenCalledWith('/ticket/new')
        })

        it('calls onResumeDraft when "Resume draft" menu item is clicked', async () => {
            const onResumeDraft = jest.fn()
            useCreateTicketButtonMock.mockReturnValue({
                ...defaultCreateTicketButton,
                hasDraft: true,
                onResumeDraft,
            } as unknown as ReturnType<typeof useCreateTicketButton>)
            const { user } = renderComponent()

            await user.click(screen.getByRole('button'))

            await user.click(await screen.findByText('Resume draft'))

            expect(onResumeDraft).toHaveBeenCalledTimes(1)
        })

        it('calls onDiscardDraft when "Discard and create new ticket" menu item is clicked', async () => {
            const onDiscardDraft = jest.fn()
            useCreateTicketButtonMock.mockReturnValue({
                ...defaultCreateTicketButton,
                hasDraft: true,
                onDiscardDraft,
                createTicketPath: '/ticket/new',
            } as unknown as ReturnType<typeof useCreateTicketButton>)
            const { user } = renderComponent()

            await user.click(screen.getByRole('button'))

            await user.click(
                await screen.findByText('Discard and create new ticket'),
            )

            expect(onDiscardDraft).toHaveBeenCalledWith('/ticket/new')
        })

        it('disables draft menu items when pathname includes /ticket/new', async () => {
            useCreateTicketButtonMock.mockReturnValue({
                ...defaultCreateTicketButton,
                hasDraft: true,
            } as unknown as ReturnType<typeof useCreateTicketButton>)
            const { user } = renderComponent(['/ticket/new'])

            await user.click(screen.getByRole('button'))

            expect(
                (await screen.findByText('Resume draft')).closest(
                    '[aria-disabled]',
                ),
            ).toHaveAttribute('aria-disabled', 'true')
            expect(
                screen
                    .getByText('Discard and create new ticket')
                    .closest('[aria-disabled]'),
            ).toHaveAttribute('aria-disabled', 'true')
        })

        it('calls setIsDeviceVisible when "Place call" menu item is clicked', async () => {
            const setIsDeviceVisible = jest.fn()
            usePlaceCallButtonMock.mockReturnValue({
                ...defaultPlaceCallButton,
                hasPhone: true,
                shouldDisplayButton: true,
                setIsDeviceVisible,
            })
            const { user } = renderComponent()

            await user.click(screen.getByRole('button'))

            await user.click(await screen.findByText('Place call'))

            expect(setIsDeviceVisible).toHaveBeenCalledWith(true)
        })

        it('disables "Place call" menu item and hides shortcut keys when device is not active', async () => {
            usePlaceCallButtonMock.mockReturnValue({
                ...defaultPlaceCallButton,
                hasPhone: true,
                shouldDisplayButton: true,
                isButtonDisabled: true,
                isDeviceActive: false,
            })
            const { user } = renderComponent()

            await user.click(screen.getByRole('button'))

            expect(await screen.findByText('Place call')).toBeInTheDocument()
            expect(screen.queryByText('E')).not.toBeInTheDocument()
        })

        it('disables "Place call" menu item and hides shortcut keys when microphone permission is denied', async () => {
            usePlaceCallButtonMock.mockReturnValue({
                ...defaultPlaceCallButton,
                hasPhone: true,
                shouldDisplayButton: true,
                isButtonDisabled: true,
                isDeviceActive: true,
            })
            const { user } = renderComponent()

            await user.click(screen.getByRole('button'))

            expect(await screen.findByText('Place call')).toBeInTheDocument()
            expect(screen.queryByText('E')).not.toBeInTheDocument()
        })

        it('shows macOS shortcut keys on "Place call" menu item when enabled', async () => {
            mockIsMacOs = true
            usePlaceCallButtonMock.mockReturnValue({
                ...defaultPlaceCallButton,
                hasPhone: true,
                shouldDisplayButton: true,
                isButtonDisabled: false,
            })
            const { user } = renderComponent()

            await user.click(screen.getByRole('button'))

            expect(await screen.findByText('Place call')).toBeInTheDocument()
            expect(screen.getByText('⌘')).toBeInTheDocument()
            expect(screen.getByText('E')).toBeInTheDocument()
        })

        it('shows ctrl shortcut key on "Place call" menu item when enabled on non-macOS', async () => {
            mockIsMacOs = false
            usePlaceCallButtonMock.mockReturnValue({
                ...defaultPlaceCallButton,
                hasPhone: true,
                shouldDisplayButton: true,
                isButtonDisabled: false,
            })
            const { user } = renderComponent()

            await user.click(screen.getByRole('button'))

            expect(await screen.findByText('Place call')).toBeInTheDocument()
            expect(screen.getByText('ctrl')).toBeInTheDocument()
            expect(screen.getByText('E')).toBeInTheDocument()
        })
    })
})
