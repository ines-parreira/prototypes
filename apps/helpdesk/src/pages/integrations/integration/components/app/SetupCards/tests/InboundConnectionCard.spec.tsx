import { render } from '@repo/testing'
import { screen, waitFor, within } from '@testing-library/react'
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

    it('renders the Disconnect button when the app is connected', () => {
        render(<InboundConnectionCard {...baseProps} isConnected={true} />, {
            storeState: baseStoreState,
        })

        expect(
            screen.getByRole('button', { name: 'Disconnect' }),
        ).toBeInTheDocument()
    })

    it('disables the Disconnect button when isDisconnectDisabled is true', () => {
        render(
            <InboundConnectionCard
                {...baseProps}
                isConnected={true}
                isDisconnectDisabled={true}
            />,
            { storeState: baseStoreState },
        )

        expect(
            screen.getByRole('button', { name: 'Disconnect' }),
        ).toBeAriaDisabled()
    })

    it('opens the confirmation modal when the Disconnect button is clicked', async () => {
        const { user } = render(
            <InboundConnectionCard {...baseProps} isConnected={true} />,
            { storeState: baseStoreState },
        )

        await user.click(screen.getByRole('button', { name: 'Disconnect' }))

        expect(
            await screen.findByRole('heading', {
                name: 'Disconnect ShipMonk?',
            }),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                /Disconnecting the app revokes its permission to send or receive your Gorgias data\./,
            ),
        ).toBeInTheDocument()
    })

    it('disconnects the app and calls onDisconnected on a successful flow', async () => {
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

        await user.click(screen.getByRole('button', { name: 'Disconnect' }))
        const dialog = await screen.findByRole('dialog')
        await user.click(
            within(dialog).getByRole('button', { name: 'Disconnect' }),
        )

        await waitFor(() => {
            expect(mockDisconnectApp).toHaveBeenCalledWith('app-123')
        })
        await waitFor(() => {
            expect(onDisconnected).toHaveBeenCalledTimes(1)
        })

        const toast = await screen.findByRole('status', {
            name: 'ShipMonk has been disconnected.',
        })
        expect(toast).toHaveAttribute('data-intent', 'success')
    })

    it('shows an error toast when the disconnect request fails', async () => {
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

        await user.click(screen.getByRole('button', { name: 'Disconnect' }))
        const dialog = await screen.findByRole('dialog')
        await user.click(
            within(dialog).getByRole('button', { name: 'Disconnect' }),
        )

        const toast = await screen.findByRole('status', {
            name: 'Sorry, something went wrong. ShipMonk is still connected.',
        })
        expect(toast).toHaveAttribute('data-intent', 'destructive')
        expect(onDisconnected).not.toHaveBeenCalled()
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
