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
    }) =>
        isLoading ? (
            <span role="status" aria-label="Loading">
                Loading…
            </span>
        ) : (
            <>{children}</>
        ),
}))

jest.mock('../components/ActionConfigTab', () => ({
    ActionConfigTab: ({
        configuration,
    }: {
        configuration: { id: string; name: string }
    }) => <div>Config form for {configuration.name}</div>,
}))

jest.mock('../components/ActionUsageTab', () => ({
    ActionUsageTab: ({
        configuration,
    }: {
        configuration: { id: string; name: string }
    }) => <div>Usage panel for {configuration.name}</div>,
}))

jest.mock('pages/aiAgent/actions/providers/GuidanceReferenceProvider', () => ({
    __esModule: true,
    default: ({ children }: { children: ReactNode }) => <>{children}</>,
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

    it('renders the action name and header controls', () => {
        renderView()

        expect(
            screen.getByRole('heading', { name: 'Get order info' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: /back to actions library/i }),
        ).toHaveAttribute('href', ACTIONS_LIBRARY_PATH)
        const enabledToggle = screen.getByRole('switch', { name: /enabled/i })
        expect(enabledToggle).toBeInTheDocument()
        expect(enabledToggle).toBeChecked()
        expect(screen.getByRole('button', { name: 'Test' })).toBeInTheDocument()
    })

    it('shows the Enabled toggle in the off state when the configuration is a draft', () => {
        mockUseGetStoreWorkflowsConfigurations.mockReturnValue(
            mockHookReturn({
                data: [{ ...baseConfiguration, is_draft: true }],
            }),
        )

        renderView()

        const enabledToggle = screen.getByRole('switch', { name: /enabled/i })
        expect(enabledToggle).toBeInTheDocument()
        expect(enabledToggle).not.toBeChecked()
    })

    it('navigates away from the action detail when the back link is clicked', async () => {
        const { user } = renderView()

        expect(
            screen.getByRole('heading', { name: 'Get order info' }),
        ).toBeInTheDocument()

        await user.click(
            screen.getByRole('link', { name: /back to actions library/i }),
        )

        await waitFor(() => {
            expect(
                screen.queryByRole('heading', { name: 'Get order info' }),
            ).not.toBeInTheDocument()
        })
    })

    it('defaults to the Configuration tab when no ?tab= param is present', () => {
        renderView()

        const configTab = screen.getByRole('tab', { name: 'Configuration' })
        const usageTab = screen.getByRole('tab', { name: 'Usage' })
        expect(configTab).toHaveAttribute('aria-selected', 'true')
        expect(usageTab).toHaveAttribute('aria-selected', 'false')
        expect(
            screen.getByText('Config form for Get order info'),
        ).toBeInTheDocument()
    })

    it('selects the Usage tab when the URL contains ?tab=usage', () => {
        renderView(`${ROUTE_URL}?tab=usage`)

        const usageTab = screen.getByRole('tab', { name: 'Usage' })
        expect(usageTab).toHaveAttribute('aria-selected', 'true')
        expect(
            screen.getByText('Usage panel for Get order info'),
        ).toBeInTheDocument()
    })

    it('updates the URL when the user switches tabs', async () => {
        const { user } = renderView()

        await user.click(screen.getByRole('tab', { name: 'Usage' }))

        await waitFor(() => {
            expect(getLocationSearch()).toBe('?tab=usage')
        })
        expect(screen.getByRole('tab', { name: 'Usage' })).toHaveAttribute(
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

        expect(screen.getByRole('alert')).toBeInTheDocument()
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
