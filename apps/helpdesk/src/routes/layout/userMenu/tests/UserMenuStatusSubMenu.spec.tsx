import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, render, userEvent } from '@repo/testing'
import { screen, waitFor, within } from '@testing-library/react'

import { Button, Menu } from '@gorgias/axiom'

import { UserMenuStatusSubMenu } from '../UserMenuStatusSubMenu'

jest.mock('@repo/agent-status', () => ({
    ...jest.requireActual('@repo/agent-status'),
    useAgentPhoneStatus: jest.fn(),
    useCustomAgentUnavailableStatusesFlag: jest.fn(),
    useSelectableAgentAvailabilityStatuses: jest.fn(),
}))

jest.mock('@repo/users', () => ({
    ...jest.requireActual('@repo/users'),
    useUpdateUserAvailability: jest.fn(),
    useUserAvailability: jest.fn(),
}))

jest.mock('@repo/logging', () => ({
    ...jest.requireActual('@repo/logging'),
    logEvent: jest.fn(),
}))

jest.mock('common/navigation/components/AvailabilityToggle', () => ({
    __esModule: true,
    default: () => <div>AvailabilityToggle</div>,
}))

const {
    useAgentPhoneStatus,
    useCustomAgentUnavailableStatusesFlag,
    useSelectableAgentAvailabilityStatuses,
} = jest.requireMock('@repo/agent-status')

const { useUpdateUserAvailability, useUserAvailability } =
    jest.requireMock('@repo/users')

const useAgentPhoneStatusMock = useAgentPhoneStatus as jest.Mock
const useCustomAgentUnavailableStatusesFlagMock =
    useCustomAgentUnavailableStatusesFlag as jest.Mock
const useSelectableAgentAvailabilityStatusesMock =
    useSelectableAgentAvailabilityStatuses as jest.Mock
const useUpdateUserAvailabilityMock = useUpdateUserAvailability as jest.Mock
const useUserAvailabilityMock = useUserAvailability as jest.Mock

const logEventMock = assumeMock(logEvent)

const availableStatus = {
    id: 'available',
    name: 'Available',
    is_system: true,
    duration_unit: null,
    duration_value: null,
}
const awayStatus = {
    id: 'away',
    name: 'Away',
    is_system: true,
    duration_unit: null,
    duration_value: null,
}
const customStatus = {
    id: 'custom-lunch',
    name: 'Lunch',
    is_system: false,
    duration_unit: 'minutes',
    duration_value: 30,
}

const allStatuses = [availableStatus, awayStatus, customStatus]

const updateSpy = jest.fn()

const renderInMenu = (userId = 1) =>
    render(
        <>
            <Menu defaultOpen trigger={<Button>Open menu</Button>}>
                <UserMenuStatusSubMenu userId={userId} />
            </Menu>
        </>,
    )

const openStatusSubMenu = async () => {
    const user = userEvent.setup()
    await user.hover(screen.getByRole('menuitem', { name: /Status/ }))
    return {
        user,
        submenu: await screen.findByRole('menu', { name: /Status/ }),
    }
}

describe('UserMenuStatusSubMenu', () => {
    beforeEach(() => {
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(true)
        useAgentPhoneStatusMock.mockReturnValue({ isOnActiveCall: false })
        useUserAvailabilityMock.mockReturnValue({
            user_id: 1,
            user_status: 'available',
        })
        useSelectableAgentAvailabilityStatusesMock.mockReturnValue({
            allStatuses,
            isLoading: false,
        })
        updateSpy.mockResolvedValue(undefined)
        useUpdateUserAvailabilityMock.mockReturnValue({
            update: updateSpy,
        })
    })

    it('refetches phone status on every menu mount', () => {
        renderInMenu()

        expect(useAgentPhoneStatusMock).toHaveBeenCalledWith(
            expect.objectContaining({ refetchOnMount: 'always' }),
        )
    })

    it('renders the legacy AvailabilityToggle when the custom statuses flag is disabled', () => {
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(false)

        renderInMenu()

        expect(screen.getByText('AvailabilityToggle')).toBeInTheDocument()
        expect(
            screen.queryByRole('menuitem', { name: /Status/ }),
        ).not.toBeInTheDocument()
    })

    it('renders a disabled Loading item while statuses are loading', async () => {
        useSelectableAgentAvailabilityStatusesMock.mockReturnValue({
            allStatuses: [],
            isLoading: true,
        })

        renderInMenu()
        const { submenu } = await openStatusSubMenu()

        expect(within(submenu).getByText('Loading...')).toBeInTheDocument()
    })

    it('renders every selectable status in the submenu', async () => {
        renderInMenu()
        const { submenu } = await openStatusSubMenu()

        expect(
            within(submenu).getByRole('menuitemradio', { name: 'Available' }),
        ).toBeInTheDocument()
        expect(
            within(submenu).getByRole('menuitemradio', { name: 'Away' }),
        ).toBeInTheDocument()
        expect(
            within(submenu).getByRole('menuitemradio', {
                name: /Lunch - 30 minutes/,
            }),
        ).toBeInTheDocument()
    })

    it('marks the active status as checked', async () => {
        useUserAvailabilityMock.mockReturnValue({
            user_id: 1,
            user_status: 'custom',
            custom_user_availability_status_id: 'away',
        })

        renderInMenu()
        const { submenu } = await openStatusSubMenu()

        expect(
            within(submenu).getByRole('menuitemradio', {
                name: 'Away',
                checked: true,
            }),
        ).toBeInTheDocument()
    })

    it('disables the status trigger when the agent is on an active call', () => {
        useAgentPhoneStatusMock.mockReturnValue({ isOnActiveCall: true })

        renderInMenu()

        expect(
            screen.getByRole('menuitem', { name: /Status/ }),
        ).toHaveAttribute('aria-disabled', 'true')
    })

    it('calls update and logs the status update on selection', async () => {
        renderInMenu(42)
        const { user, submenu } = await openStatusSubMenu()

        await user.click(
            within(submenu).getByRole('menuitemradio', { name: 'Away' }),
        )

        await waitFor(() => {
            expect(updateSpy).toHaveBeenCalledWith('custom', 'away')
        })
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.MenuUserLinkClicked,
            { link: 'status-update', status_id: 'away' },
        )
    })

    it('shows the Gorgias API error message in a toast when the update fails with a Gorgias API error', async () => {
        const apiError = Object.assign(new Error('Only admins can do that'), {
            isAxiosError: true,
            response: { data: { error: { msg: 'Only admins can do that' } } },
        })
        updateSpy.mockRejectedValueOnce(apiError)

        renderInMenu()
        const { user, submenu } = await openStatusSubMenu()

        await user.click(
            within(submenu).getByRole('menuitemradio', { name: 'Away' }),
        )

        expect(
            await screen.findByText('Only admins can do that'),
        ).toBeInTheDocument()
        expect(logEventMock).not.toHaveBeenCalled()
    })

    it('shows a fallback error message when the update fails with a generic error', async () => {
        updateSpy.mockRejectedValueOnce(new Error('boom'))

        renderInMenu()
        const { user, submenu } = await openStatusSubMenu()

        await user.click(
            within(submenu).getByRole('menuitemradio', { name: 'Away' }),
        )

        expect(
            await screen.findByText(
                'Failed to update status. Please try again.',
            ),
        ).toBeInTheDocument()
    })
})
