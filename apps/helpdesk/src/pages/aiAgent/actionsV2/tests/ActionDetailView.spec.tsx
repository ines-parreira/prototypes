import type { ReactNode } from 'react'

import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import { useLocation } from 'react-router-dom'

import { useGetStoreWorkflowsConfigurations } from 'models/workflows/queries'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import useApps from 'pages/automate/actionsPlatform/hooks/useApps'

import ActionDetailView from '../ActionDetailView'

const LOCATION_PROBE_PREFIX = 'probe-search:'
const LocationProbe = () => {
    const location = useLocation()
    return <div>{`${LOCATION_PROBE_PREFIX}${location.search}`}</div>
}

jest.mock('models/workflows/queries')
jest.mock('pages/automate/actionsPlatform/hooks/useApps')
jest.mock('pages/aiAgent/hooks/useAiAgentNavigation')
jest.mock('pages/aiAgent/components/AiAgentLayout/AiAgentLayout', () => ({
    AiAgentLayout: ({
        children,
        isLoading,
    }: {
        children?: ReactNode
        isLoading?: boolean
    }) => (
        <div data-testing="ai-agent-layout">
            {isLoading ? (
                <span role="status" aria-label="Loading">
                    Loading…
                </span>
            ) : (
                children
            )}
        </div>
    ),
}))

const mockUseGetStoreWorkflowsConfigurations = jest.mocked(
    useGetStoreWorkflowsConfigurations,
)
const mockUseApps = jest.mocked(useApps)
const mockUseAiAgentNavigation = jest.mocked(useAiAgentNavigation)

const ROUTE_PATH = '/app/ai-agent/:shopType/:shopName/actions/edit/:id'
const ROUTE_URL = '/app/ai-agent/shopify/my-shop/actions/edit/cfg-1'
const ACTIONS_LIBRARY_PATH = '/app/ai-agent/shopify/my-shop/actions'

const baseConfiguration = {
    id: 'cfg-1',
    name: 'Get order info',
    description: 'Fetch order details from Shopify',
    is_draft: false,
    apps: [{ type: 'shopify' }],
    steps: [],
    triggers: [],
}

const mockHookReturn = (
    overrides: Record<string, unknown> = {},
): ReturnType<typeof useGetStoreWorkflowsConfigurations> =>
    ({
        data: [baseConfiguration],
        isInitialLoading: false,
        ...overrides,
    }) as unknown as ReturnType<typeof useGetStoreWorkflowsConfigurations>

const renderView = (initialUrl = ROUTE_URL) =>
    render(
        <>
            <ActionDetailView />
            <LocationProbe />
        </>,
        {
            path: ROUTE_PATH,
            initialEntries: [initialUrl],
        },
    )

const getLocationSearch = () =>
    (
        screen.getByText(
            (_, element) =>
                element?.textContent?.startsWith(LOCATION_PROBE_PREFIX) ===
                true,
        ).textContent ?? ''
    ).slice(LOCATION_PROBE_PREFIX.length)

describe('<ActionDetailView />', () => {
    beforeAll(() => {
        Element.prototype.getAnimations = () => []
    })

    beforeEach(() => {
        jest.resetAllMocks()
        mockUseGetStoreWorkflowsConfigurations.mockReturnValue(mockHookReturn())
        mockUseApps.mockReturnValue({
            apps: [],
            actionsApps: [],
            isLoading: false,
        } as unknown as ReturnType<typeof useApps>)
        mockUseAiAgentNavigation.mockReturnValue({
            routes: { actions: ACTIONS_LIBRARY_PATH },
            navigationItems: [],
        } as unknown as ReturnType<typeof useAiAgentNavigation>)
    })

    afterEach(() => {
        document.title = ''
    })

    it('fetches the configuration by id', () => {
        renderView()

        expect(mockUseGetStoreWorkflowsConfigurations).toHaveBeenCalledWith(
            {
                storeName: 'my-shop',
                storeType: 'shopify',
                triggers: ['llm-prompt'],
            },
            {},
            ['cfg-1'],
        )
    })

    it('renders the action name, status badge and header controls', () => {
        renderView()

        expect(
            screen.getByRole('heading', { name: 'Get order info' }),
        ).toBeInTheDocument()
        expect(screen.getByText('Active')).toBeInTheDocument()
        expect(
            screen.getByRole('switch', { name: /disable action/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /delete action/i }),
        ).toBeInTheDocument()
    })

    it('shows the Draft badge and "Enable action" label when the configuration is a draft', () => {
        mockUseGetStoreWorkflowsConfigurations.mockReturnValue(
            mockHookReturn({
                data: [{ ...baseConfiguration, is_draft: true }],
            }),
        )

        renderView()

        expect(screen.getByText('Draft')).toBeInTheDocument()
        expect(
            screen.getByRole('switch', { name: /enable action/i }),
        ).toBeInTheDocument()
    })

    it('renders the breadcrumb back to the Actions Library', () => {
        renderView()

        const nav = screen.getByRole('navigation', { name: 'Breadcrumb' })
        expect(nav).toBeInTheDocument()
        const libraryLink = screen.getByRole('link', {
            name: 'Actions Library',
        })
        expect(libraryLink).toHaveAttribute('href', ACTIONS_LIBRARY_PATH)
    })

    it('defaults to the Usage tab when no ?tab= param is present', () => {
        renderView()

        const usageTab = screen.getByRole('tab', { name: 'Usage' })
        const configTab = screen.getByRole('tab', { name: 'Config' })
        expect(usageTab).toHaveAttribute('aria-selected', 'true')
        expect(configTab).toHaveAttribute('aria-selected', 'false')
        expect(
            screen.getByText('Usage tab content coming soon.'),
        ).toBeInTheDocument()
    })

    it('selects the Config tab when the URL contains ?tab=config', () => {
        renderView(`${ROUTE_URL}?tab=config`)

        const configTab = screen.getByRole('tab', { name: 'Config' })
        expect(configTab).toHaveAttribute('aria-selected', 'true')
        expect(
            screen.getByText('Config tab content coming soon.'),
        ).toBeInTheDocument()
    })

    it('updates the URL when the user switches tabs', async () => {
        const { user } = renderView()

        await user.click(screen.getByRole('tab', { name: 'Config' }))

        await waitFor(() => {
            expect(getLocationSearch()).toBe('?tab=config')
        })
        expect(screen.getByRole('tab', { name: 'Config' })).toHaveAttribute(
            'aria-selected',
            'true',
        )
    })

    it('shows the loading state while the configuration is fetching', () => {
        mockUseGetStoreWorkflowsConfigurations.mockReturnValue(
            mockHookReturn({
                data: undefined,
                isInitialLoading: true,
            }),
        )

        renderView()

        expect(
            screen.getByRole('status', { name: 'Loading' }),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole('tab', { name: 'Usage' }),
        ).not.toBeInTheDocument()
    })

    it('announces a 404 alert when the configuration is missing', () => {
        mockUseGetStoreWorkflowsConfigurations.mockReturnValue(
            mockHookReturn({
                data: [],
            }),
        )

        renderView()

        const alert = screen.getByRole('alert')
        expect(alert).toHaveAttribute('aria-live', 'assertive')
        expect(
            screen.getByRole('heading', { name: 'Action not found' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: 'Back to Actions' }),
        ).toHaveAttribute('href', ACTIONS_LIBRARY_PATH)
    })

    it('sets document.title to include the action name and restores it on unmount', () => {
        document.title = 'Initial title'
        const { unmount } = renderView()

        expect(document.title).toBe('Edit: Get order info — Actions')

        unmount()
        expect(document.title).toBe('Initial title')
    })
})
