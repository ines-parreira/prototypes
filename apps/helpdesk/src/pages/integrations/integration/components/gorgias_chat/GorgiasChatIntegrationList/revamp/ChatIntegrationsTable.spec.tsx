import { history } from '@repo/routing'
import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import { IntegrationType } from '@gorgias/helpdesk-types'

import { GorgiasChatCreationWizardStatus } from 'models/integration/types'
import { Tab } from 'pages/integrations/integration/types'

import { ChatIntegrationsTable } from './ChatIntegrationsTable'

jest.mock('@repo/routing', () => ({
    history: {
        push: jest.fn(),
    },
}))

const MockChatCell = jest.fn(({ chat }) => (
    <div data-testid="chat-cell">{chat.get('name')}</div>
))

const MockStoreIntegrationCell = jest.fn(
    ({ storeIntegration, chatIntegrationId }) => (
        <div data-testid="store-integration-cell">
            <span data-testid="chat-integration-id">{chatIntegrationId}</span>
            <span data-testid="store-name">
                {storeIntegration?.get('name') || 'No Store'}
            </span>
        </div>
    ),
)

const MockStatusCell = jest.fn(({ chat, loading }) => (
    <div data-testid="status-cell">
        <span data-testid="chat-id">{chat.get('id')}</span>
        <span data-testid="loading-status">
            {loading.get('status') ? 'loading' : 'ready'}
        </span>
    </div>
))

const MockActionsCell = jest.fn(({ chat, storeIntegration }) => (
    <div data-testid="actions-cell">
        <span data-testid="actions-chat-id">{chat.get('id')}</span>
        <span data-testid="actions-store-id">
            {storeIntegration?.get('id') || 'no-store'}
        </span>
    </div>
))

const MockAiAgentStatusCell = jest.fn(({ chat, storeIntegration }) => (
    <div data-testid="ai-agent-status-cell">
        <span data-testid="ai-agent-chat-id">{chat.get('id')}</span>
        <span data-testid="ai-agent-store-id">
            {storeIntegration?.get('id') || 'no-store'}
        </span>
    </div>
))

jest.mock('./ChatCell', () => ({
    ChatCell: (props: any) => MockChatCell(props),
}))

jest.mock('./StoreIntegrationCell', () => ({
    StoreIntegrationCell: (props: any) => MockStoreIntegrationCell(props),
}))

jest.mock('./StatusCell', () => ({
    StatusCell: (props: any) => MockStatusCell(props),
}))

jest.mock('./ActionsCell', () => ({
    ActionsCell: (props: any) => MockActionsCell(props),
}))

jest.mock('./AiAgentStatusCell', () => ({
    AiAgentStatusCell: (props: any) => MockAiAgentStatusCell(props),
}))

const MockHeaderRowGroup = jest.fn(({ headerGroups }) => (
    <div data-testid="header-row-group">Headers: {headerGroups.length}</div>
))

const MockTableBodyContent = jest.fn(({ rows, columnCount, onRowClick }) => (
    <div data-testid="table-body-content">
        <div data-testid="rows-count">{rows.length}</div>
        <div data-testid="columns-count">{columnCount}</div>
        {rows.map((row: any, index: number) => (
            <div
                key={index}
                data-testid={`row-${index}`}
                onClick={() => onRowClick?.(row.original)}
            >
                Row {index}
            </div>
        ))}
    </div>
))

jest.mock('@gorgias/axiom', () => ({
    createSortableColumn: jest.fn((accessorKey, header, cellRenderer) => ({
        accessorKey,
        header,
        cell: cellRenderer,
        enableSorting: true,
    })),
    HeaderRowGroup: (props: any) => MockHeaderRowGroup(props),
    TableBodyContent: (props: any) => MockTableBodyContent(props),
    TableHeader: ({ children }: any) => (
        <div data-testid="table-header">{children}</div>
    ),
    TableRoot: ({ children }: any) => (
        <div data-testid="table-root">{children}</div>
    ),
    useTable: jest.fn((config) => ({
        getHeaderGroups: () => [{ id: 'header-1' }, { id: 'header-2' }],
        getRowModel: () => ({
            rows: config.data.map((item: any, index: number) => ({
                id: index,
                original: item,
            })),
        }),
    })),
}))

const historyPushMock = assumeMock(history.push)

const renderComponent = ({
    chats = fromJS([]),
    integrations = fromJS([]),
    loading = fromJS({}),
}: {
    chats?: any
    integrations?: any
    loading?: any
}) => {
    return render(
        <ChatIntegrationsTable
            chats={chats}
            integrations={integrations}
            loading={loading}
        />,
    )
}

describe('ChatIntegrationsTable', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Table Structure', () => {
        it('renders table with header and body', () => {
            const chats = fromJS([
                {
                    id: 1,
                    name: 'Chat 1',
                    meta: {},
                },
            ])

            renderComponent({ chats })

            expect(screen.getByTestId('table-root')).toBeInTheDocument()
            expect(screen.getByTestId('table-header')).toBeInTheDocument()
            expect(screen.getByTestId('table-body-content')).toBeInTheDocument()
        })

        it('renders correct number of rows', () => {
            const chats = fromJS([
                { id: 1, name: 'Chat 1', meta: {} },
                { id: 2, name: 'Chat 2', meta: {} },
                { id: 3, name: 'Chat 3', meta: {} },
            ])

            renderComponent({ chats })

            expect(screen.getByTestId('rows-count')).toHaveTextContent('3')
        })

        it('renders correct number of columns', () => {
            const chats = fromJS([{ id: 1, name: 'Chat 1', meta: {} }])

            renderComponent({ chats })

            expect(screen.getByTestId('columns-count')).toHaveTextContent('5')
        })
    })

    describe('Data Structure', () => {
        it('creates correct data structure with chat field', () => {
            const chats = fromJS([
                {
                    id: 1,
                    name: 'Customer Support',
                    meta: {},
                },
            ])

            renderComponent({ chats })

            const calls = MockTableBodyContent.mock.calls[0][0]
            const rowData = calls.rows[0].original

            expect(rowData.chat).toBeDefined()
            expect(rowData.chat.get('id')).toBe(1)
            expect(rowData.chat.get('name')).toBe('Customer Support')
        })

        it('creates correct storeIntegration field structure', () => {
            const chats = fromJS([
                {
                    id: 1,
                    name: 'Chat 1',
                    meta: { shop_integration_id: 100 },
                },
            ])

            const integrations = fromJS([
                {
                    id: 100,
                    name: 'Shopify Store',
                },
            ])

            renderComponent({ chats, integrations })

            const calls = MockTableBodyContent.mock.calls[0][0]
            const rowData = calls.rows[0].original

            expect(rowData.storeIntegration).toEqual({
                chat: chats.get(0),
                storeIntegration: integrations.get(0),
            })
        })

        it('creates correct status field structure', () => {
            const chats = fromJS([
                {
                    id: 1,
                    name: 'Chat 1',
                    meta: {},
                },
            ])

            const loading = fromJS({ status: true })

            renderComponent({ chats, loading })

            const calls = MockTableBodyContent.mock.calls[0][0]
            const rowData = calls.rows[0].original

            expect(rowData.status).toEqual({
                chat: chats.get(0),
                loading,
            })
        })

        it('creates correct actions field structure', () => {
            const chats = fromJS([
                {
                    id: 1,
                    name: 'Chat 1',
                    meta: { shop_integration_id: 100 },
                },
            ])

            const integrations = fromJS([
                {
                    id: 100,
                    name: 'Shopify Store',
                },
            ])

            renderComponent({ chats, integrations })

            const calls = MockTableBodyContent.mock.calls[0][0]
            const rowData = calls.rows[0].original

            expect(rowData.actions).toEqual({
                chat: chats.get(0),
                storeIntegration: integrations.get(0),
            })
        })

        it('creates correct aiAgentStatus field structure', () => {
            const chats = fromJS([
                {
                    id: 1,
                    name: 'Chat 1',
                    meta: { shop_integration_id: 100 },
                },
            ])

            const integrations = fromJS([
                {
                    id: 100,
                    name: 'Shopify Store',
                },
            ])

            renderComponent({ chats, integrations })

            const calls = MockTableBodyContent.mock.calls[0][0]
            const rowData = calls.rows[0].original

            expect(rowData.aiAgentStatus).toEqual({
                chat: chats.get(0),
            })
        })
    })

    describe('Store Integration Mapping', () => {
        it('matches store integration by shop_integration_id', () => {
            const chats = fromJS([
                {
                    id: 1,
                    name: 'Chat 1',
                    meta: { shop_integration_id: 100 },
                },
            ])

            const integrations = fromJS([
                { id: 99, name: 'Store 1' },
                { id: 100, name: 'Store 2' },
                { id: 101, name: 'Store 3' },
            ])

            renderComponent({ chats, integrations })

            const calls = MockTableBodyContent.mock.calls[0][0]
            const rowData = calls.rows[0].original
            const storeIntegration = rowData.storeIntegration.storeIntegration

            expect(storeIntegration.get('id')).toBe(100)
            expect(storeIntegration.get('name')).toBe('Store 2')
        })

        it('handles chat without shop_integration_id', () => {
            const chats = fromJS([
                {
                    id: 1,
                    name: 'Chat 1',
                    meta: {},
                },
            ])

            const integrations = fromJS([{ id: 100, name: 'Store 1' }])

            renderComponent({ chats, integrations })

            const calls = MockTableBodyContent.mock.calls[0][0]
            const rowData = calls.rows[0].original
            const storeIntegration = rowData.storeIntegration.storeIntegration

            expect(storeIntegration).toBeUndefined()
        })

        it('handles non-existent shop_integration_id', () => {
            const chats = fromJS([
                {
                    id: 1,
                    name: 'Chat 1',
                    meta: { shop_integration_id: 999 },
                },
            ])

            const integrations = fromJS([{ id: 100, name: 'Store 1' }])

            renderComponent({ chats, integrations })

            const calls = MockTableBodyContent.mock.calls[0][0]
            const rowData = calls.rows[0].original
            const storeIntegration = rowData.storeIntegration.storeIntegration

            expect(storeIntegration).toBeUndefined()
        })
    })

    describe('Row Click Navigation', () => {
        it('navigates to appearance tab for published wizard', async () => {
            const user = userEvent.setup()

            const chats = fromJS([
                {
                    id: 123,
                    name: 'Chat 1',
                    meta: {
                        wizard: {
                            status: GorgiasChatCreationWizardStatus.Published,
                        },
                    },
                },
            ])

            renderComponent({ chats })

            await user.click(screen.getByTestId('row-0'))

            expect(historyPushMock).toHaveBeenCalledWith(
                `/app/settings/channels/${IntegrationType.GorgiasChat}/123/${Tab.Appearance}`,
            )
        })

        it('navigates to create wizard tab for draft wizard', async () => {
            const user = userEvent.setup()

            const chats = fromJS([
                {
                    id: 456,
                    name: 'Chat 2',
                    meta: {
                        wizard: {
                            status: GorgiasChatCreationWizardStatus.Draft,
                        },
                    },
                },
            ])

            renderComponent({ chats })

            await user.click(screen.getByTestId('row-0'))

            expect(historyPushMock).toHaveBeenCalledWith(
                `/app/settings/channels/${IntegrationType.GorgiasChat}/456/${Tab.CreateWizard}`,
            )
        })

        it('navigates to installation tab when store needs scope update', async () => {
            const user = userEvent.setup()

            const chats = fromJS([
                {
                    id: 789,
                    name: 'Chat 3',
                    meta: {
                        shop_integration_id: 100,
                        wizard: {
                            status: GorgiasChatCreationWizardStatus.Published,
                        },
                    },
                },
            ])

            const integrations = fromJS([
                {
                    id: 100,
                    name: 'Store 1',
                    meta: { need_scope_update: true },
                },
            ])

            renderComponent({ chats, integrations })

            await user.click(screen.getByTestId('row-0'))

            expect(historyPushMock).toHaveBeenCalledWith(
                `/app/settings/channels/${IntegrationType.GorgiasChat}/789/${Tab.Installation}`,
            )
        })

        it('navigates to appearance tab when store does not need scope update', async () => {
            const user = userEvent.setup()

            const chats = fromJS([
                {
                    id: 111,
                    name: 'Chat 4',
                    meta: {
                        shop_integration_id: 200,
                        wizard: {
                            status: GorgiasChatCreationWizardStatus.Published,
                        },
                    },
                },
            ])

            const integrations = fromJS([
                {
                    id: 200,
                    name: 'Store 2',
                    meta: { need_scope_update: false },
                },
            ])

            renderComponent({ chats, integrations })

            await user.click(screen.getByTestId('row-0'))

            expect(historyPushMock).toHaveBeenCalledWith(
                `/app/settings/channels/${IntegrationType.GorgiasChat}/111/${Tab.Appearance}`,
            )
        })

        it('handles chat without store integration', async () => {
            const user = userEvent.setup()

            const chats = fromJS([
                {
                    id: 222,
                    name: 'Chat 5',
                    meta: {
                        wizard: {
                            status: GorgiasChatCreationWizardStatus.Published,
                        },
                    },
                },
            ])

            renderComponent({ chats })

            await user.click(screen.getByTestId('row-0'))

            expect(historyPushMock).toHaveBeenCalledWith(
                `/app/settings/channels/${IntegrationType.GorgiasChat}/222/${Tab.Appearance}`,
            )
        })
    })

    describe('Empty State', () => {
        it('renders table with no rows when chats list is empty', () => {
            renderComponent({ chats: fromJS([]) })

            expect(screen.getByTestId('table-root')).toBeInTheDocument()
            expect(screen.getByTestId('rows-count')).toHaveTextContent('0')
        })
    })
})
