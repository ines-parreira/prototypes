import { render } from '@repo/testing'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import { disconnectApp } from 'models/integration/resources'
import InboundConnectionCard from 'pages/integrations/integration/components/app/SetupCards/InboundConnectionCard'

jest.mock('models/integration/resources', () => ({
    ...jest.requireActual('models/integration/resources'),
    disconnectApp: jest.fn(),
}))

const mockDisconnectApp = jest.mocked(disconnectApp)

const baseStoreState = {
    currentAccount: fromJS({ domain: 'acme' }),
    integrations: fromJS({ integrations: [] }),
}

const baseProps = {
    appId: 'app-123',
    appTitle: 'ShipMonk',
    connectUrl: 'https://shipmonk.example.com/install',
    isConnected: false,
    isDisconnectDisabled: false,
}

describe('<InboundConnectionCard />', () => {
    beforeEach(() => {
        mockDisconnectApp.mockReset()
    })

    it('renders the Authorize action when the app is not connected', () => {
        render(<InboundConnectionCard {...baseProps} />, {
            storeState: baseStoreState,
        })

        expect(
            screen.getByRole('heading', {
                name: 'Let ShipMonk read your Gorgias data',
            }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: /Authorize/ }),
        ).toBeInTheDocument()
    })

    it('renders the Revoke button when the app is connected', () => {
        render(<InboundConnectionCard {...baseProps} isConnected={true} />, {
            storeState: baseStoreState,
        })

        expect(
            screen.getByRole('button', { name: 'Revoke' }),
        ).toBeInTheDocument()
    })

    it('disables the Revoke button when isDisconnectDisabled is true', () => {
        render(
            <InboundConnectionCard
                {...baseProps}
                isConnected={true}
                isDisconnectDisabled={true}
            />,
            { storeState: baseStoreState },
        )

        expect(
            screen.getByRole('button', { name: 'Revoke' }),
        ).toBeAriaDisabled()
    })

    it('opens the confirmation modal when the Revoke button is clicked', async () => {
        const { user } = render(
            <InboundConnectionCard {...baseProps} isConnected={true} />,
            { storeState: baseStoreState },
        )

        await user.click(screen.getByRole('button', { name: 'Revoke' }))

        expect(
            await screen.findByRole('heading', {
                name: 'Revoke access for ShipMonk?',
            }),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                /Revoking access removes ShipMonk's permission to send or receive your Gorgias data\./,
            ),
        ).toBeInTheDocument()
    })

    it('closes the confirmation modal when Cancel is clicked', async () => {
        const { user } = render(
            <InboundConnectionCard {...baseProps} isConnected={true} />,
            { storeState: baseStoreState },
        )

        await user.click(screen.getByRole('button', { name: 'Revoke' }))
        const dialog = await screen.findByRole('dialog')
        await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
        expect(mockDisconnectApp).not.toHaveBeenCalled()
    })

    it('revokes access and calls onDisconnected on a successful flow', async () => {
        const onDisconnected = jest.fn().mockResolvedValue(undefined)
        mockDisconnectApp.mockResolvedValueOnce(true)

        const { user } = render(
            <InboundConnectionCard
                {...baseProps}
                isConnected={true}
                onDisconnected={onDisconnected}
            />,
            { storeState: baseStoreState },
        )

        await user.click(screen.getByRole('button', { name: 'Revoke' }))
        const dialog = await screen.findByRole('dialog')
        await user.click(within(dialog).getByRole('button', { name: 'Revoke' }))

        await waitFor(() => {
            expect(mockDisconnectApp).toHaveBeenCalledWith('app-123')
        })
        await waitFor(() => {
            expect(onDisconnected).toHaveBeenCalledTimes(1)
        })

        const toast = await screen.findByRole('status', {
            name: 'Access to ShipMonk has been revoked.',
        })
        expect(toast).toHaveAttribute('data-intent', 'success')
    })

    it('shows an error toast when the revoke request fails', async () => {
        const onDisconnected = jest.fn()
        mockDisconnectApp.mockResolvedValueOnce(false)

        const { user } = render(
            <InboundConnectionCard
                {...baseProps}
                isConnected={true}
                onDisconnected={onDisconnected}
            />,
            { storeState: baseStoreState },
        )

        await user.click(screen.getByRole('button', { name: 'Revoke' }))
        const dialog = await screen.findByRole('dialog')
        await user.click(within(dialog).getByRole('button', { name: 'Revoke' }))

        const toast = await screen.findByRole('status', {
            name: 'Sorry, something went wrong. Access to ShipMonk was not revoked.',
        })
        expect(toast).toHaveAttribute('data-intent', 'destructive')
        expect(onDisconnected).not.toHaveBeenCalled()
    })

    it('polls onAuthorizeReturn after clicking Authorize until isConnected flips true', async () => {
        jest.useFakeTimers()
        const onAuthorizeReturn = jest.fn().mockResolvedValue(undefined)
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        })

        const { rerender } = render(
            <InboundConnectionCard
                {...baseProps}
                onAuthorizeReturn={onAuthorizeReturn}
            />,
            { storeState: baseStoreState },
        )

        expect(
            screen.getByRole('link', { name: /Authorize/ }),
        ).toBeInTheDocument()

        await user.click(screen.getByRole('link', { name: /Authorize/ }))

        jest.advanceTimersByTime(3000)
        expect(onAuthorizeReturn).toHaveBeenCalledTimes(1)

        jest.advanceTimersByTime(3000)
        expect(onAuthorizeReturn).toHaveBeenCalledTimes(2)

        rerender(
            <InboundConnectionCard
                {...baseProps}
                isConnected={true}
                onAuthorizeReturn={onAuthorizeReturn}
            />,
        )

        expect(
            screen.getByRole('button', { name: 'Revoke' }),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole('link', { name: /Authorize/ }),
        ).not.toBeInTheDocument()

        jest.advanceTimersByTime(10000)
        expect(onAuthorizeReturn).toHaveBeenCalledTimes(2)

        jest.runOnlyPendingTimers()
        jest.useRealTimers()
    })

    it('stops polling after the max duration even when not connected', async () => {
        jest.useFakeTimers()
        const onAuthorizeReturn = jest.fn().mockResolvedValue(undefined)
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        })

        render(
            <InboundConnectionCard
                {...baseProps}
                onAuthorizeReturn={onAuthorizeReturn}
            />,
            { storeState: baseStoreState },
        )

        await user.click(screen.getByRole('link', { name: /Authorize/ }))

        jest.advanceTimersByTime(5 * 60 * 1000)
        const callsAfterMax = onAuthorizeReturn.mock.calls.length
        expect(callsAfterMax).toBeGreaterThan(0)

        jest.advanceTimersByTime(30 * 1000)
        expect(onAuthorizeReturn).toHaveBeenCalledTimes(callsAfterMax)

        jest.runOnlyPendingTimers()
        jest.useRealTimers()
    })

    it('does not call onAuthorizeReturn before Authorize is clicked', () => {
        jest.useFakeTimers()
        const onAuthorizeReturn = jest.fn()

        render(
            <InboundConnectionCard
                {...baseProps}
                onAuthorizeReturn={onAuthorizeReturn}
            />,
            { storeState: baseStoreState },
        )

        jest.advanceTimersByTime(10000)
        expect(onAuthorizeReturn).not.toHaveBeenCalled()

        jest.runOnlyPendingTimers()
        jest.useRealTimers()
    })

    it('renders the AlloyConnectButton when an alloy integration id is provided', () => {
        render(
            <InboundConnectionCard
                {...baseProps}
                alloyIntegrationId="alloy-xyz"
            />,
            { storeState: baseStoreState },
        )

        expect(
            screen.getByRole('button', { name: /Connect App/ }),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole('link', { name: /Authorize/ }),
        ).not.toBeInTheDocument()
    })
})
