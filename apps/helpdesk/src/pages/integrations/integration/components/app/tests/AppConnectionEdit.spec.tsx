import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import type {
    ServiceConnectionApiDTO,
    ServiceConnectionAuthApiDTO,
} from 'models/integration/types/serviceConnection'
import AppConnectionEdit from 'pages/integrations/integration/components/app/AppConnectionEdit'

const APP_ID = '1234'
const CONNECTION_ID = '01970000-0000-7000-8000-000000000001'
const APP_BASE_URL = `/app/settings/integrations/app/${APP_ID}`
const CONNECTIONS_URL = `${APP_BASE_URL}/connections`
const EDIT_URL = `${CONNECTIONS_URL}/${CONNECTION_ID}`

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({ push: mockHistoryPush }),
}))

const baseConnection: ServiceConnectionApiDTO = {
    id: CONNECTION_ID,
    name: 'ShipMonk connection 1',
    service: 'shipmonk',
    url: 'https://api.shipmonk.com',
    status: 'active',
    created_datetime: '2026-05-01T00:00:00',
    updated_datetime: null,
    trashed_datetime: null,
    created_by: 1,
    updated_by: null,
    trashed_by: null,
    external_id: null,
    vendor: null,
}

const basicAuth: ServiceConnectionAuthApiDTO = {
    type: 'bearer-token',
    location: 'header',
    key: 'Authorization',
    value: '',
}

const oauth2Auth: ServiceConnectionAuthApiDTO = {
    type: 'oauth2',
    location: 'header',
    key: 'Authorization',
    value: '',
}

function buildHandlers(options?: {
    auth?: ServiceConnectionAuthApiDTO
    connection?: ServiceConnectionApiDTO
    onUpdate?: (body: Record<string, unknown>) => Response
}) {
    const auth = options?.auth ?? basicAuth
    const connection = options?.connection ?? baseConnection
    return [
        http.get(`*/api/service-connections/${CONNECTION_ID}`, () =>
            HttpResponse.json(connection),
        ),
        http.get(`*/api/service-connections/${CONNECTION_ID}/auth/`, () =>
            HttpResponse.json(auth),
        ),
        http.put(
            `*/api/service-connections/${CONNECTION_ID}`,
            async ({ request }) => {
                const body = (await request.json()) as Record<string, unknown>
                if (options?.onUpdate) {
                    return options.onUpdate(body)
                }
                return HttpResponse.json({
                    ...connection,
                    name: (body.name as string) ?? connection.name,
                })
            },
        ),
    ]
}

const server = setupServer(...buildHandlers())

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers(...buildHandlers())
    mockHistoryPush.mockReset()
})

afterAll(() => {
    server.close()
})

const renderComponent = () =>
    render(<AppConnectionEdit />, {
        path: '/app/settings/integrations/app/:appId/connections/:connectionId',
        initialEntries: [EDIT_URL],
    })

describe('AppConnectionEdit', () => {
    it('renders the breadcrumbs and the connection name as heading', async () => {
        renderComponent()

        expect(
            await screen.findByRole('heading', {
                name: 'ShipMonk connection 1',
            }),
        ).toBeInTheDocument()

        expect(screen.getByRole('link', { name: 'Apps' })).toHaveAttribute(
            'href',
            '/app/settings/integrations',
        )
        expect(screen.getByRole('link', { name: 'shipmonk' })).toHaveAttribute(
            'href',
            APP_BASE_URL,
        )
        expect(
            screen.getByRole('link', { name: 'Connections' }),
        ).toHaveAttribute('href', CONNECTIONS_URL)
    })

    it('renders basic-auth fields and omits OAuth2-specific fields', async () => {
        renderComponent()

        expect(await screen.findByLabelText(/^Name/)).toHaveValue(
            'ShipMonk connection 1',
        )
        expect(screen.getByLabelText(/^URL/)).toHaveValue(
            'https://api.shipmonk.com',
        )
        expect(screen.getByLabelText('Token value')).toBeInTheDocument()
        expect(screen.getByLabelText(/^Token key/)).toHaveValue('Authorization')

        expect(screen.queryByLabelText('Token URL')).not.toBeInTheDocument()
        expect(screen.queryByLabelText('Client ID')).not.toBeInTheDocument()
        expect(screen.queryByLabelText('Client secret')).not.toBeInTheDocument()
        expect(screen.queryByLabelText('Scopes')).not.toBeInTheDocument()
    })

    it('renders OAuth2-specific fields when the auth type is oauth2', async () => {
        server.use(...buildHandlers({ auth: oauth2Auth }))

        renderComponent()

        expect(await screen.findByLabelText('Token URL')).toBeInTheDocument()
        expect(screen.getByLabelText('Client ID')).toBeInTheDocument()
        expect(screen.getByLabelText('Client secret')).toBeInTheDocument()
        expect(screen.getByLabelText('Scopes')).toBeInTheDocument()
        expect(screen.queryByLabelText('Token value')).not.toBeInTheDocument()
    })

    it('keeps the Save button disabled until the form is dirty', async () => {
        const { user } = renderComponent()

        const saveButton = await screen.findByRole('button', { name: 'Save' })
        expect(saveButton).toBeDisabled()

        await user.type(await screen.findByLabelText(/^Name/), '!')
        expect(saveButton).toBeEnabled()
    })

    it('saves the basic-auth payload and shows a success toast', async () => {
        let receivedBody: Record<string, unknown> | undefined
        server.use(
            ...buildHandlers({
                onUpdate: (body) => {
                    receivedBody = body
                    return HttpResponse.json({ ...baseConnection })
                },
            }),
        )

        const { user } = renderComponent()

        const nameInput = await screen.findByLabelText(/^Name/)
        await user.clear(nameInput)
        await user.type(nameInput, 'New name')
        await user.type(await screen.findByLabelText('Token value'), 'secret')

        await user.click(screen.getByRole('button', { name: 'Save' }))

        await waitFor(() => {
            expect(receivedBody).toEqual({
                name: 'New name',
                url: 'https://api.shipmonk.com',
                auth: {
                    type: 'bearer-token',
                    location: 'header',
                    key: 'Authorization',
                    value: 'secret',
                },
            })
        })

        expect(
            await screen.findByRole('status', { name: 'Saved New name.' }),
        ).toBeInTheDocument()
    })

    it('saves the OAuth2 payload only including the fields that were changed', async () => {
        let receivedBody: Record<string, unknown> | undefined
        server.use(
            ...buildHandlers({
                auth: oauth2Auth,
                onUpdate: (body) => {
                    receivedBody = body
                    return HttpResponse.json({ ...baseConnection })
                },
            }),
        )

        const { user } = renderComponent()

        await user.type(
            await screen.findByLabelText('Token URL'),
            'https://api.example.com/token',
        )
        await user.type(screen.getByLabelText('Client ID'), 'my-client-id')
        await user.type(screen.getByLabelText('Scopes'), 'read write')

        await user.click(screen.getByRole('button', { name: 'Save' }))

        await waitFor(() => {
            expect(receivedBody?.auth).toEqual({
                type: 'oauth2',
                location: 'header',
                key: 'Authorization',
                token_url: 'https://api.example.com/token',
                client_id: 'my-client-id',
                scopes: 'read write',
            })
        })
    })

    it('shows an error toast when the update request fails', async () => {
        server.use(
            ...buildHandlers({
                onUpdate: () =>
                    HttpResponse.json(
                        { error: { msg: 'Backend exploded' } },
                        { status: 500 },
                    ),
            }),
        )

        const { user } = renderComponent()

        await user.type(await screen.findByLabelText(/^Name/), '!')
        await user.click(screen.getByRole('button', { name: 'Save' }))

        expect(
            await screen.findByRole('status', { name: 'Backend exploded' }),
        ).toBeInTheDocument()
    })

    it('shows a generic error toast when the update fails with a non-Gorgias error shape', async () => {
        server.use(
            ...buildHandlers({
                onUpdate: () => new HttpResponse(null, { status: 500 }),
            }),
        )

        const { user } = renderComponent()

        await user.type(await screen.findByLabelText(/^Name/), '!')
        await user.click(screen.getByRole('button', { name: 'Save' }))

        expect(
            await screen.findByRole('status', {
                name: 'Failed to save the connection.',
            }),
        ).toBeInTheDocument()
    })

    it('navigates back to the connections list when the back button is clicked', async () => {
        const { user } = renderComponent()

        await user.click(
            await screen.findByRole('button', { name: 'Back to connections' }),
        )

        expect(mockHistoryPush).toHaveBeenCalledWith(CONNECTIONS_URL)
    })
})
