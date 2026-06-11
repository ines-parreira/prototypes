import type { ReactNode } from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { handleError } from 'pages/aiAgent/actions/hooks/errorHandler'
import type { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'

import { ActionLibraryView } from '../ActionLibraryView'

jest.mock('pages/aiAgent/components/AiAgentLayout/AiAgentLayout', () => ({
    AiAgentLayout: ({
        title,
        titleChildren,
        children,
    }: {
        title: ReactNode
        titleChildren?: ReactNode
        children?: ReactNode
    }) => (
        <div>
            <header>
                <h1>{title}</h1>
                {titleChildren}
            </header>
            <main>{children}</main>
        </div>
    ),
}))

jest.mock('pages/aiAgent/actions/providers/StoreTrackstarProvider', () => ({
    __esModule: true,
    StoreTrackstarProvider: ({ children }: { children?: ReactNode }) => (
        <>{children}</>
    ),
}))
jest.mock('pages/aiAgent/actions/providers/StoreAppsProvider', () => ({
    __esModule: true,
    StoreAppsProvider: ({ children }: { children?: ReactNode }) => (
        <>{children}</>
    ),
}))
jest.mock('pages/aiAgent/actions/providers/GuidanceReferenceProvider', () => ({
    __esModule: true,
    GuidanceReferenceProvider: ({ children }: { children?: ReactNode }) => (
        <>{children}</>
    ),
}))

jest.mock(
    'pages/aiAgent/actionsV2/components/ActionLibraryUpdatesBanner/ActionLibraryUpdatesBanner',
    () => ({
        __esModule: true,
        ActionLibraryUpdatesBanner: () => null,
    }),
)

const mockPush = jest.fn()
jest.mock('react-router-dom', () => {
    const actual = jest.requireActual('react-router-dom')
    return {
        ...actual,
        useHistory: () => ({ push: mockPush }),
        useParams: () => ({ shopName: 'test-shop', shopType: 'shopify' }),
    }
})

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    useAiAgentNavigation: () => ({
        routes: {
            newAction: () => '/app/ai-agent/shopify/test-shop/actions/new',
            editAction: (id: string) =>
                `/app/ai-agent/shopify/test-shop/actions/edit/${id}`,
            actionEvents: (id: string) =>
                `/app/ai-agent/shopify/test-shop/actions/events/${id}`,
            skills: '/app/ai-agent/shopify/test-shop/skills',
            knowledgeArticle: (type: string, id: number) =>
                `/app/ai-agent/shopify/test-shop/knowledge/${type}/${id}`,
            appDetail: (id: string) =>
                `/app/settings/integrations/app/${id}/actions`,
        },
        navigationItems: [],
    }),
}))

jest.mock('pages/aiAgent/actions/hooks/errorHandler', () => ({
    handleError: jest.fn(),
}))

jest.mock('models/workflows/queries', () => ({
    useGetStoreWorkflowsConfigurations: jest.fn(),
    useListActionsApps: jest.fn(),
    useGetWorkflowConfigurationTemplates: jest.fn(),
}))
jest.mock('models/integration/queries', () => ({
    useListServiceConnectionsByAppIds: jest.fn(),
    useGetAppsByIds: jest.fn(),
}))
jest.mock('pages/automate/actionsPlatform/hooks/useApps', () => ({
    __esModule: true,
    useApps: () => ({ apps: [], actionsApps: [] }),
}))
jest.mock(
    'pages/automate/actionsPlatform/hooks/useGetAppFromTemplateApp',
    () => ({
        __esModule: true,
        useGetAppFromTemplateApp: () => () => undefined,
    }),
)
jest.mock('pages/aiAgent/actions/hooks/useDeleteAction', () => ({
    __esModule: true,
    useDeleteAction: () => ({ mutate: jest.fn(), isLoading: false }),
}))

const {
    useGetStoreWorkflowsConfigurations,
    useListActionsApps,
    useGetWorkflowConfigurationTemplates,
} = jest.requireMock('models/workflows/queries') as {
    useGetStoreWorkflowsConfigurations: jest.Mock
    useListActionsApps: jest.Mock
    useGetWorkflowConfigurationTemplates: jest.Mock
}

const { useListServiceConnectionsByAppIds, useGetAppsByIds } = jest.requireMock(
    'models/integration/queries',
) as {
    useListServiceConnectionsByAppIds: jest.Mock
    useGetAppsByIds: jest.Mock
}

const mockHandleError = jest.mocked(handleError)

const makeAction = (
    overrides: Partial<StoreWorkflowsConfiguration> & {
        id: string
        name: string
    },
): StoreWorkflowsConfiguration =>
    ({
        internal_id: `internal-${overrides.id}`,
        apps: [],
        steps: [],
        entrypoints: [
            {
                kind: 'llm-conversation',
                trigger: 'llm-prompt',
                settings: { instructions: '', requires_confirmation: false },
                deactivated_datetime: null,
            },
        ],
        ...overrides,
    }) as unknown as StoreWorkflowsConfiguration

const setStoreActions = (
    actions: StoreWorkflowsConfiguration[],
    extra?: Partial<{
        isInitialLoading: boolean
        isError: boolean
        error: unknown
    }>,
) => {
    useGetStoreWorkflowsConfigurations.mockReturnValue({
        data: actions,
        isInitialLoading: false,
        isError: false,
        error: null,
        ...extra,
    })
}

describe('ActionLibraryView', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        useListActionsApps.mockReturnValue({ data: [] })
        useListServiceConnectionsByAppIds.mockReturnValue([])
        useGetAppsByIds.mockReturnValue([])
        useGetWorkflowConfigurationTemplates.mockReturnValue({ data: [] })
        setStoreActions([])
    })

    it('renders the page title and description', () => {
        render(<ActionLibraryView />)

        expect(
            screen.getByRole('heading', { level: 1, name: /^actions$/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByText(/manage actions available to AI Agent/i),
        ).toBeInTheDocument()
    })

    it('shows the empty state when there are no actions and the empty state Create button navigates to create', async () => {
        const user = userEvent.setup()
        render(<ActionLibraryView />)

        expect(
            screen.getByRole('heading', {
                name: /power ai agent with actions/i,
            }),
        ).toBeInTheDocument()

        const createButtons = screen.getAllByRole('button', {
            name: /create action/i,
        })
        // Last "Create action" button is the empty-state one (header is first).
        await user.click(createButtons[createButtons.length - 1])

        expect(mockPush).toHaveBeenCalledWith(
            '/app/ai-agent/shopify/test-shop/actions/new',
        )
    })

    it('renders rows when actions exist and the table is sortable', async () => {
        const user = userEvent.setup()
        setStoreActions([
            makeAction({ id: 'a', name: 'Bravo action' }),
            makeAction({ id: 'b', name: 'Alpha action' }),
        ])

        render(<ActionLibraryView />)

        expect(
            screen.getByRole('link', { name: /open action alpha action/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: /open action bravo action/i }),
        ).toBeInTheDocument()

        // Clicking the Action column header toggles to sorting by name.
        await user.click(
            screen.getByRole('columnheader', { name: /^action\s/i }),
        )

        const rowsAfterFirstClick = screen.getAllByRole('link', {
            name: /open action/i,
        })
        expect(rowsAfterFirstClick[0]).toHaveAccessibleName(
            /open action alpha action/i,
        )
        expect(rowsAfterFirstClick[1]).toHaveAccessibleName(
            /open action bravo action/i,
        )

        // Clicking it again reverses the order.
        await user.click(
            screen.getByRole('columnheader', { name: /^action\s/i }),
        )

        const rowsAfterSecondClick = screen.getAllByRole('link', {
            name: /open action/i,
        })
        expect(rowsAfterSecondClick[0]).toHaveAccessibleName(
            /open action bravo action/i,
        )
        expect(rowsAfterSecondClick[1]).toHaveAccessibleName(
            /open action alpha action/i,
        )
    })

    it('sorts by status, putting failed before enabled', async () => {
        const user = userEvent.setup()
        useListServiceConnectionsByAppIds.mockReturnValue([
            {
                isSuccess: true,
                isInitialLoading: false,
                isError: false,
                data: [
                    {
                        id: 'c1',
                        status: 'invalid',
                        trashed_datetime: null,
                    },
                ],
                error: null,
            },
        ])

        setStoreActions([
            makeAction({ id: 'ok', name: 'Healthy action' }),
            makeAction({
                id: 'broken',
                name: 'Broken action',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                apps: [{ type: 'app', app_id: 'shipbob' }] as any,
            }),
        ])

        render(<ActionLibraryView />)

        await user.click(screen.getByRole('columnheader', { name: /status/i }))

        const rows = screen.getAllByRole('link', { name: /open action/i })
        expect(rows[0]).toHaveAccessibleName(/open action broken action/i)
        expect(rows[1]).toHaveAccessibleName(/open action healthy action/i)
    })

    it('filters actions when the user types in the search box', async () => {
        const user = userEvent.setup()
        setStoreActions([
            makeAction({ id: 'a', name: 'Cancel order' }),
            makeAction({ id: 'b', name: 'Refund customer' }),
        ])

        render(<ActionLibraryView />)

        await user.type(
            screen.getByRole('textbox', { name: /search actions/i }),
            'refund',
        )

        expect(
            screen.queryByRole('link', { name: /open action cancel order/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: /open action refund customer/i }),
        ).toBeInTheDocument()
        expect(screen.getByText('Showing 1 of 2 items')).toBeInTheDocument()
    })

    it('calls handleError when fetching actions fails', () => {
        const error = new Error('Boom')
        setStoreActions([], { isError: true, error })

        render(<ActionLibraryView />)

        expect(mockHandleError).toHaveBeenCalledWith(
            error,
            'Failed to load actions. Please try again later.',
        )
    })

    it('renders the header Create action button that pushes to the new action route', async () => {
        const user = userEvent.setup()
        setStoreActions([makeAction({ id: 'a', name: 'Alpha' })])

        render(<ActionLibraryView />)

        await user.click(
            screen.getByRole('button', { name: /^create action$/i }),
        )

        expect(mockPush).toHaveBeenCalledWith(
            '/app/ai-agent/shopify/test-shop/actions/new',
        )
    })

    it('paginates through actions when there are more than a single page', async () => {
        const user = userEvent.setup()
        // 16 actions, with default page size of 14 → 2 pages.
        const actions = Array.from({ length: 16 }, (_, idx) =>
            makeAction({
                id: `id-${idx}`,
                name: `Action ${String(idx).padStart(2, '0')}`,
            }),
        )
        setStoreActions(actions)

        render(<ActionLibraryView />)

        // First page shows the first 14 actions.
        expect(
            screen.getByRole('link', { name: /open action action 00/i }),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole('link', { name: /open action action 15/i }),
        ).not.toBeInTheDocument()

        const nextButtons = screen.getAllByRole('button')
        // The pagination next button has a chevron icon and is the only enabled
        // non-Create non-menu button at the bottom of the table. Find it by
        // ruling out the create/header buttons.
        const nextButton = nextButtons.find(
            (button) =>
                button
                    .getAttribute('aria-label')
                    ?.toLowerCase()
                    .includes('next') ||
                button.textContent?.toLowerCase().includes('chevron-right'),
        )
        expect(nextButton).toBeDefined()
        await user.click(nextButton!)

        // After clicking next, the 15th item appears.
        expect(
            await screen.findByRole('link', {
                name: /open action action 15/i,
            }),
        ).toBeInTheDocument()
    })
})
