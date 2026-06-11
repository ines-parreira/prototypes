import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useLocation } from 'react-router-dom'

import type { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'

import type { ActivityAlert } from '../../hooks/useActivityAlerts'
import { useActivityAlerts } from '../../hooks/useActivityAlerts'
import type { ServiceConnectionStatuses } from '../../hooks/useServiceConnectionStatuses'
import { ActivitySection } from '../ActivitySection'

jest.mock('../../hooks/useActivityAlerts')

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    useAiAgentNavigation: () => ({
        routes: {
            appConnections: (appId: string) =>
                `/app/settings/integrations/app/${appId}/connections`,
        },
    }),
}))

const mockUseActivityAlerts = jest.mocked(useActivityAlerts)

const LocationPath = () => {
    const location = useLocation()
    return <div data-test-location>{location.pathname}</div>
}

const SHOP_NAME = 'shopify-store'
const INITIAL_PATH = `/app/ai-agent/shopify/${SHOP_NAME}/actions`

const serviceConnectionStatuses: ServiceConnectionStatuses = {
    byAppId: {},
    isError: false,
    isLoading: false,
}

const buildReconnectAlert = (
    overrides: Partial<ActivityAlert> = {},
): ActivityAlert => ({
    kind: 'reconnect',
    appId: 'app-loop',
    appName: 'Loop Returns',
    ...overrides,
})

const renderSection = () =>
    render(
        <>
            <ActivitySection
                shopName={SHOP_NAME}
                actions={[] as StoreWorkflowsConfiguration[]}
                serviceConnectionStatuses={serviceConnectionStatuses}
            />
            <LocationPath />
        </>,
        {
            initialEntries: [INITIAL_PATH],
        },
    )

describe('<ActivitySection />', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('renders nothing when there are no alerts', () => {
        mockUseActivityAlerts.mockReturnValue({ visible: [], overflowCount: 0 })

        renderSection()

        expect(
            screen.queryByRole('region', { name: /activity/i }),
        ).not.toBeInTheDocument()
    })

    it('renders one card per alert inside the action-alerts region', () => {
        mockUseActivityAlerts.mockReturnValue({
            visible: [
                buildReconnectAlert({
                    appId: 'app-loop',
                    appName: 'Loop Returns',
                }),
                buildReconnectAlert({
                    appId: 'app-shipbob',
                    appName: 'ShipBob',
                }),
            ],
            overflowCount: 0,
        })

        renderSection()

        expect(
            screen.getByRole('region', { name: /activity/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('group', { name: /loop returns/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('group', { name: /shipbob/i }),
        ).toBeInTheDocument()
    })

    it('navigates to the connections page when Reconnect is clicked', async () => {
        const user = userEvent.setup()
        mockUseActivityAlerts.mockReturnValue({
            visible: [
                buildReconnectAlert({
                    appId: 'app-loop',
                    appName: 'Loop Returns',
                }),
            ],
            overflowCount: 0,
        })

        renderSection()

        await user.click(screen.getByRole('button', { name: /reconnect/i }))

        expect(
            screen.getByText(
                '/app/settings/integrations/app/app-loop/connections',
            ),
        ).toBeInTheDocument()
    })

    it('shows a More-alerts button only when there are more cards than fit in the viewport', () => {
        mockUseActivityAlerts.mockReturnValue({
            visible: Array.from({ length: 4 }, (_, i) =>
                buildReconnectAlert({
                    appId: `app-${i}`,
                    appName: `App ${i}`,
                }),
            ),
            overflowCount: 0,
        })

        renderSection()

        expect(
            screen.getByRole('button', { name: /more alerts/i }),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /previous alerts/i }),
        ).not.toBeInTheDocument()
    })

    it('does not render scroll arrows when all cards fit in the viewport', () => {
        mockUseActivityAlerts.mockReturnValue({
            visible: [
                buildReconnectAlert({
                    appId: 'app-loop',
                    appName: 'Loop Returns',
                }),
            ],
            overflowCount: 0,
        })

        renderSection()

        expect(
            screen.queryByRole('button', { name: /more alerts/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /previous alerts/i }),
        ).not.toBeInTheDocument()
    })

    it('advances the carousel transform when More alerts is clicked', async () => {
        const user = userEvent.setup()
        mockUseActivityAlerts.mockReturnValue({
            visible: Array.from({ length: 5 }, (_, i) =>
                buildReconnectAlert({
                    appId: `app-${i}`,
                    appName: `App ${i}`,
                }),
            ),
            overflowCount: 0,
        })

        const { container } = renderSection()

        const track = container.querySelector(
            '[style*="translate3d"]',
        ) as HTMLElement | null
        expect(track?.style.transform).toBe('translate3d(0px, 0, 0)')

        await user.click(screen.getByRole('button', { name: /more alerts/i }))

        expect(track?.style.transform).toBe('translate3d(-384px, 0, 0)')
    })

    it('reveals a Previous-alerts arrow once the carousel has scrolled, and rewinds when clicked', async () => {
        const user = userEvent.setup()
        mockUseActivityAlerts.mockReturnValue({
            visible: Array.from({ length: 5 }, (_, i) =>
                buildReconnectAlert({
                    appId: `app-${i}`,
                    appName: `App ${i}`,
                }),
            ),
            overflowCount: 0,
        })

        const { container } = renderSection()

        const track = container.querySelector(
            '[style*="translate3d"]',
        ) as HTMLElement | null

        expect(
            screen.queryByRole('button', { name: /previous alerts/i }),
        ).not.toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: /more alerts/i }))

        const previousButton = screen.getByRole('button', {
            name: /previous alerts/i,
        })
        expect(previousButton).toBeInTheDocument()

        await user.click(previousButton)

        expect(track?.style.transform).toBe('translate3d(0px, 0, 0)')
        expect(
            screen.queryByRole('button', { name: /previous alerts/i }),
        ).not.toBeInTheDocument()
    })
})
