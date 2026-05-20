import { render } from '@repo/testing'
import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockListStoresHandler } from '@gorgias/helpdesk-mocks'

import type {
    ServiceConnectionApiDTO,
    StoreForServiceConnectionApiDTO,
} from 'models/integration/types/serviceConnection'
import AppActionsConnections from 'pages/integrations/integration/components/app/AppActionsConnections'

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({ push: mockHistoryPush }),
}))

const APP_ID = '1234'
const CONNECT_URL = 'https://example.com/connect'

const CONNECTION_1_ID = '01970000-0000-7000-8000-000000000001'
const CONNECTION_2_ID = '01970000-0000-7000-8000-000000000002'
const CONNECTION_3_ID = '01970000-0000-7000-8000-000000000003'

const baseConnection = {
    service: 'shipmonk',
    url: 'https://api.shipmonk.com',
    created_datetime: '2026-05-01T00:00:00',
    updated_datetime: null,
    trashed_datetime: null,
    created_by: 1,
    updated_by: null,
    trashed_by: null,
    external_id: null,
    vendor: null,
} satisfies Omit<ServiceConnectionApiDTO, 'id' | 'name' | 'status'>

const connections: ServiceConnectionApiDTO[] = [
    {
        ...baseConnection,
        id: CONNECTION_1_ID,
        name: 'ShipMonk connection 1',
        status: 'active',
    },
    {
        ...baseConnection,
        id: CONNECTION_2_ID,
        name: 'ShipMonk connection 2',
        status: 'invalid',
    },
    {
        ...baseConnection,
        id: CONNECTION_3_ID,
        name: 'ShipMonk connection 3',
        status: 'active',
    },
]

const storesByConnectionId: Record<string, StoreForServiceConnectionApiDTO[]> =
    {
        [CONNECTION_1_ID]: [],
        [CONNECTION_2_ID]: [
            {
                service_connection_id: CONNECTION_2_ID,
                store_id: 2,
                store_type: 'shopify',
                store_name: 'steve-madden-us',
                created_datetime: '2026-05-01T00:00:00',
                updated_datetime: '2026-05-01T00:00:00',
            },
            {
                service_connection_id: CONNECTION_2_ID,
                store_id: 3,
                store_type: 'shopify',
                store_name: 'steve-madden-uk',
                created_datetime: '2026-05-01T00:00:00',
                updated_datetime: '2026-05-01T00:00:00',
            },
        ],
        [CONNECTION_3_ID]: [
            {
                service_connection_id: CONNECTION_3_ID,
                store_id: 4,
                store_type: 'shopify',
                store_name: 'steve-madden-eu',
                created_datetime: '2026-05-01T00:00:00',
                updated_datetime: '2026-05-01T00:00:00',
            },
        ],
    }

const mockListStores = mockListStoresHandler()

function defaultHandlers() {
    return [
        mockListStores.handler,
        http.get('*/api/service-connections/', () =>
            HttpResponse.json({ data: connections, meta: {} }),
        ),
        http.get(
            '*/api/service-connections/:connectionId/stores/',
            ({ params }) =>
                HttpResponse.json({
                    data:
                        storesByConnectionId[params.connectionId as string] ??
                        [],
                    meta: {},
                }),
        ),
    ]
}

const server = setupServer(...defaultHandlers())

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers(...defaultHandlers())
    mockHistoryPush.mockReset()
})

afterAll(() => {
    server.close()
})

const renderComponent = () =>
    render(<AppActionsConnections appId={APP_ID} connectUrl={CONNECT_URL} />, {
        initialEntries: [
            `/app/settings/integrations/app/${APP_ID}/connections`,
        ],
    })

describe('AppActionsConnections', () => {
    it('renders the intro text and item counter', async () => {
        renderComponent()

        expect(
            await screen.findByText(
                'Link each connection to a store to run its actions in AI Agent.',
            ),
        ).toBeInTheDocument()
        expect(screen.getByText('Showing 3 of 3 items')).toBeInTheDocument()
    })

    it('renders all three connections sorted ascending', async () => {
        renderComponent()

        const rows = await screen.findAllByRole('row')
        // 1 header row + 3 connection rows
        expect(rows).toHaveLength(4)

        expect(
            within(rows[1]!).getByText('ShipMonk connection 1'),
        ).toBeInTheDocument()
        expect(
            within(rows[2]!).getByText('ShipMonk connection 2'),
        ).toBeInTheDocument()
        expect(
            within(rows[3]!).getByText('ShipMonk connection 3'),
        ).toBeInTheDocument()
    })

    it('renders Healthy/Unhealthy status based on the connection status', async () => {
        renderComponent()

        const rows = await screen.findAllByRole('row')
        expect(within(rows[1]!).getByText('Healthy')).toBeInTheDocument()
        expect(within(rows[2]!).getByText('Unhealthy')).toBeInTheDocument()
        expect(within(rows[3]!).getByText('Healthy')).toBeInTheDocument()
    })

    it('shows a "Connect store" button on the connection that has no linked stores', async () => {
        renderComponent()

        await screen.findByText('ShipMonk connection 1')
        const rows = screen.getAllByRole('row')
        const connectionWithoutStore = rows[1]!

        expect(
            within(connectionWithoutStore).getByRole('button', {
                name: /connect store/i,
            }),
        ).toBeInTheDocument()
    })

    it('renders store chips for connections that already have linked stores', async () => {
        renderComponent()

        expect(await screen.findByText('steve-madden-us')).toBeInTheDocument()
        expect(screen.getByText('steve-madden-uk')).toBeInTheDocument()
        expect(screen.getByText('steve-madden-eu')).toBeInTheDocument()
    })

    it('exposes Delete and Open buttons with the connection name in the aria-label', async () => {
        renderComponent()

        await screen.findByText('ShipMonk connection 1')

        expect(
            screen.getByRole('button', {
                name: 'Delete ShipMonk connection 1',
            }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Open ShipMonk connection 1' }),
        ).toBeInTheDocument()
    })

    it('opens a confirmation popover when the delete button is clicked', async () => {
        const { user } = renderComponent()

        await screen.findByText('ShipMonk connection 1')

        await user.click(
            screen.getByRole('button', {
                name: 'Delete ShipMonk connection 1',
            }),
        )

        expect(
            await screen.findByText('Delete connection?'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(/Are you sure you want to delete this connection/),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Delete' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Cancel' }),
        ).toBeInTheDocument()
    })

    it('closes the delete popover when Cancel is clicked', async () => {
        const { user } = renderComponent()

        await user.click(
            await screen.findByRole('button', {
                name: 'Delete ShipMonk connection 1',
            }),
        )
        await user.click(await screen.findByRole('button', { name: 'Cancel' }))

        expect(screen.queryByText('Delete connection?')).not.toBeInTheDocument()
    })

    it('toggles the sort direction when the Connection header is clicked', async () => {
        const { user } = renderComponent()

        const connectionHeader = await screen.findByRole('columnheader', {
            name: /connection/i,
        })

        let rows = screen.getAllByRole('row')
        expect(
            within(rows[1]!).getByText('ShipMonk connection 1'),
        ).toBeInTheDocument()
        expect(
            within(rows[3]!).getByText('ShipMonk connection 3'),
        ).toBeInTheDocument()

        await user.click(connectionHeader)

        rows = screen.getAllByRole('row')
        expect(
            within(rows[1]!).getByText('ShipMonk connection 3'),
        ).toBeInTheDocument()
        expect(
            within(rows[3]!).getByText('ShipMonk connection 1'),
        ).toBeInTheDocument()
    })

    it('renders the empty state when there are no connections', async () => {
        server.use(
            http.get('*/api/service-connections/', () =>
                HttpResponse.json({ data: [], meta: {} }),
            ),
        )

        renderComponent()

        expect(
            await screen.findByText('No connections yet.'),
        ).toBeInTheDocument()
    })

    it('deletes the connection on confirmation and shows a success toast', async () => {
        let receivedTrashUrl: string | undefined
        server.use(
            http.put(
                `*/api/service-connections/${CONNECTION_1_ID}/trash/`,
                ({ request }) => {
                    receivedTrashUrl = request.url
                    return HttpResponse.json({
                        ...connections[0],
                        trashed_datetime: '2026-05-02T00:00:00',
                    })
                },
            ),
        )

        const { user } = renderComponent()

        await user.click(
            await screen.findByRole('button', {
                name: 'Delete ShipMonk connection 1',
            }),
        )
        await user.click(await screen.findByRole('button', { name: 'Delete' }))

        expect(
            await screen.findByRole('status', {
                name: 'Deleted ShipMonk connection 1.',
            }),
        ).toBeInTheDocument()
        expect(receivedTrashUrl).toContain(
            `/api/service-connections/${CONNECTION_1_ID}/trash/`,
        )
    })

    it('shows an error toast when the delete request fails', async () => {
        server.use(
            http.put(
                `*/api/service-connections/${CONNECTION_1_ID}/trash/`,
                () => new HttpResponse(null, { status: 500 }),
            ),
        )

        const { user } = renderComponent()

        await user.click(
            await screen.findByRole('button', {
                name: 'Delete ShipMonk connection 1',
            }),
        )
        await user.click(await screen.findByRole('button', { name: 'Delete' }))

        expect(
            await screen.findByRole('status', {
                name: 'Failed to delete ShipMonk connection 1.',
            }),
        ).toBeInTheDocument()
    })

    it('shows an error toast when the connections list fails to load', async () => {
        server.use(
            http.get(
                '*/api/service-connections/',
                () => new HttpResponse(null, { status: 500 }),
            ),
        )

        renderComponent()

        expect(
            await screen.findByRole('status', {
                name: 'Failed to load connections. Please try again.',
            }),
        ).toBeInTheDocument()
    })

    it('navigates to the connection edit page when the Open button is clicked', async () => {
        const { user } = renderComponent()

        await user.click(
            await screen.findByRole('button', {
                name: 'Open ShipMonk connection 1',
            }),
        )

        expect(mockHistoryPush).toHaveBeenCalledWith(
            `/app/settings/integrations/app/${APP_ID}/connections/${CONNECTION_1_ID}`,
        )
    })
})
