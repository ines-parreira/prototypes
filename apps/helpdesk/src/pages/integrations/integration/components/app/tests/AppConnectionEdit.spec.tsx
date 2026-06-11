import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import type {
    ServiceConnectionApiDTO,
    ServiceConnectionAuthApiDTO,
} from 'models/integration/types/serviceConnection'
import { AppConnectionEdit } from 'pages/integrations/integration/components/app/AppConnectionEdit'

const APP_ID = '1234'
const CONNECTION_ID = '01970000-0000-7000-8000-000000000001'
const APP_BASE_URL = `/app/settings/integrations/app/${APP_ID}`
const CREDENTIALS_URL = `${APP_BASE_URL}/credentials`
const EDIT_URL = `${CREDENTIALS_URL}/${CONNECTION_ID}`

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

const prefilledBearerAuth: ServiceConnectionAuthApiDTO = {
    type: 'bearer-token',
    location: 'header',
    key: 'Authorization',
    value: 'existing-secret',
}

const oauth2Auth: ServiceConnectionAuthApiDTO = {
    type: 'oauth2',
    location: 'header',
    key: 'Authorization',
    value: '',
}

const prefilledOauth2Auth: ServiceConnectionAuthApiDTO = {
    type: 'oauth2',
    location: 'header',
    key: 'Authorization',
    value: 'existing-oauth-secret',
}

const customSchemeAuth: ServiceConnectionAuthApiDTO = {
    type: 'custom-scheme',
    location: 'header',
    key: 'Authorization',
    value: '',
    scheme: 'Klaviyo-API-Key',
}

function buildHandlers(options?: {
    auth?: ServiceConnectionAuthApiDTO
    connection?: ServiceConnectionApiDTO
    appTitle?: string
    onUpdate?: (body: Record<string, unknown>) => Response | Promise<Response>
}) {
    const auth = options?.auth ?? basicAuth
    const connection = options?.connection ?? baseConnection
    const appTitle = options?.appTitle ?? 'ShipMonk'
    return [
        http.get(`*/api/apps/${APP_ID}`, () =>
            HttpResponse.json({ id: APP_ID, name: appTitle }),
        ),
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
        path: '/app/settings/integrations/app/:appId/credentials/:connectionId',
        initialEntries: [EDIT_URL],
    })

describe('AppConnectionEdit', () => {
    it('renders the breadcrumbs with the app title and the connection name as heading', async () => {
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
        expect(
            await screen.findByRole('link', { name: 'ShipMonk' }),
        ).toHaveAttribute('href', APP_BASE_URL)
        expect(
            screen.getByRole('link', { name: 'Credentials' }),
        ).toHaveAttribute('href', CREDENTIALS_URL)
    })

    it('renders basic-auth fields and omits OAuth2-specific fields', async () => {
        renderComponent()

        expect(await screen.findByLabelText(/^Name/)).toHaveValue(
            'ShipMonk connection 1',
        )
        expect(screen.getByLabelText(/^Bearer token/)).toBeInTheDocument()

        expect(screen.queryByLabelText('Token URL')).not.toBeInTheDocument()
        expect(screen.queryByLabelText('Client ID')).not.toBeInTheDocument()
        expect(
            screen.queryByLabelText(/^Client secret/),
        ).not.toBeInTheDocument()
        expect(screen.queryByLabelText('Scopes')).not.toBeInTheDocument()
    })

    it('renders OAuth2-specific fields when the auth type is oauth2', async () => {
        server.use(...buildHandlers({ auth: oauth2Auth }))

        renderComponent()

        expect(await screen.findByLabelText('Token URL')).toBeInTheDocument()
        expect(screen.getByLabelText('Client ID')).toBeInTheDocument()
        expect(screen.getByLabelText(/^Client secret/)).toBeInTheDocument()
        expect(screen.getByLabelText('Scopes')).toBeInTheDocument()
        expect(screen.queryByLabelText(/^Bearer token/)).not.toBeInTheDocument()
    })

    it('uses the auth key as the value label when it is custom', async () => {
        server.use(
            ...buildHandlers({
                auth: {
                    type: 'api-key',
                    location: 'header',
                    key: 'X-ShipMonk-Token',
                    value: '',
                },
            }),
        )

        renderComponent()

        expect(
            await screen.findByLabelText(/^X-ShipMonk-Token/),
        ).toBeInTheDocument()
    })

    it('uses "API key" when the auth key is x-api-key', async () => {
        server.use(
            ...buildHandlers({
                auth: {
                    type: 'api-key',
                    location: 'header',
                    key: 'x-api-key',
                    value: '',
                },
            }),
        )

        renderComponent()

        expect(await screen.findByLabelText(/^API key/)).toBeInTheDocument()
    })

    it('keeps the Save button disabled until name and the auth value are set', async () => {
        const { user } = renderComponent()

        const saveButton = await screen.findByRole('button', { name: 'Save' })
        expect(saveButton).toBeDisabled()

        await user.type(await screen.findByLabelText(/^Name/), '!')
        expect(saveButton).toBeDisabled()

        await user.type(screen.getByLabelText(/^Bearer token/), 'secret')
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
        await user.type(screen.getByLabelText(/^Bearer token/), 'secret')

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
            await screen.findByRole('status', { name: 'Credentials updated' }),
        ).toBeInTheDocument()
        expect(mockHistoryPush).toHaveBeenCalledWith(CREDENTIALS_URL)
    })

    it('saves the OAuth2 payload with the fields that were changed', async () => {
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
        await user.type(screen.getByLabelText(/^Client secret/), 'super-secret')
        await user.type(screen.getByLabelText('Scopes'), 'read write')

        await user.click(screen.getByRole('button', { name: 'Save' }))

        await waitFor(() => {
            expect(receivedBody?.auth).toEqual({
                type: 'oauth2',
                location: 'header',
                key: 'Authorization',
                token_url: 'https://api.example.com/token',
                client_id: 'my-client-id',
                client_secret: 'super-secret',
                scopes: 'read write',
            })
        })
    })

    it('shows a friendly error toast when the update request fails', async () => {
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
        await user.type(screen.getByLabelText(/^Bearer token/), 'secret')
        await user.click(screen.getByRole('button', { name: 'Save' }))

        expect(
            await screen.findByRole('status', {
                name: "Couldn't update credentials. Check that they're correct and try again.",
            }),
        ).toBeInTheDocument()
    })

    it('navigates back to the credentials list when the back button is clicked', async () => {
        const { user } = renderComponent()

        await user.click(
            await screen.findByRole('button', { name: 'Back to credentials' }),
        )

        expect(mockHistoryPush).toHaveBeenCalledWith(CREDENTIALS_URL)
    })

    it('updates the heading to reflect the typed name', async () => {
        const { user } = renderComponent()

        const nameInput = await screen.findByLabelText(/^Name/)
        await user.clear(nameInput)
        await user.type(nameInput, 'My new connection')

        expect(
            screen.getByRole('heading', { name: 'My new connection' }),
        ).toBeInTheDocument()
    })

    it('falls back to the connection name in the heading when the name field is cleared', async () => {
        const { user } = renderComponent()

        const nameInput = await screen.findByLabelText(/^Name/)
        await user.clear(nameInput)

        expect(
            screen.getByRole('heading', { name: 'ShipMonk connection 1' }),
        ).toBeInTheDocument()
    })

    it('omits the auth field from the payload when only the name changes', async () => {
        let receivedBody: Record<string, unknown> | undefined
        server.use(
            ...buildHandlers({
                auth: prefilledBearerAuth,
                onUpdate: (body) => {
                    receivedBody = body
                    return HttpResponse.json({ ...baseConnection })
                },
            }),
        )

        const { user } = renderComponent()

        const nameInput = await screen.findByLabelText(/^Name/)
        await user.clear(nameInput)
        await user.type(nameInput, 'Renamed')
        await user.click(screen.getByRole('button', { name: 'Save' }))

        await waitFor(() => {
            expect(receivedBody).toEqual({
                name: 'Renamed',
                url: 'https://api.shipmonk.com',
            })
        })
        expect(receivedBody).not.toHaveProperty('auth')
    })

    it('omits the auth field from the OAuth2 payload when only the name changes', async () => {
        let receivedBody: Record<string, unknown> | undefined
        server.use(
            ...buildHandlers({
                auth: prefilledOauth2Auth,
                onUpdate: (body) => {
                    receivedBody = body
                    return HttpResponse.json({ ...baseConnection })
                },
            }),
        )

        const { user } = renderComponent()

        const nameInput = await screen.findByLabelText(/^Name/)
        await user.clear(nameInput)
        await user.type(nameInput, 'Renamed OAuth')
        await user.click(screen.getByRole('button', { name: 'Save' }))

        await waitFor(() => {
            expect(receivedBody).toEqual({
                name: 'Renamed OAuth',
                url: 'https://api.shipmonk.com',
            })
        })
        expect(receivedBody).not.toHaveProperty('auth')
    })

    it('includes only the OAuth2 fields that the user filled in', async () => {
        let receivedBody: Record<string, unknown> | undefined
        server.use(
            ...buildHandlers({
                auth: prefilledOauth2Auth,
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
        await user.click(screen.getByRole('button', { name: 'Save' }))

        await waitFor(() => {
            expect(receivedBody?.auth).toEqual({
                type: 'oauth2',
                location: 'header',
                key: 'Authorization',
                token_url: 'https://api.example.com/token',
                client_secret: 'existing-oauth-secret',
            })
        })
    })

    it('labels the value field with the scheme for custom-scheme auth', async () => {
        server.use(...buildHandlers({ auth: customSchemeAuth }))

        renderComponent()

        expect(
            await screen.findByLabelText(/^Klaviyo-API-Key/),
        ).toBeInTheDocument()
    })

    it('forwards the scheme on update for custom-scheme auth', async () => {
        let receivedBody: Record<string, unknown> | undefined
        server.use(
            ...buildHandlers({
                auth: customSchemeAuth,
                onUpdate: (body) => {
                    receivedBody = body
                    return HttpResponse.json({ ...baseConnection })
                },
            }),
        )

        const { user } = renderComponent()

        await user.type(
            await screen.findByLabelText(/^Klaviyo-API-Key/),
            'new-secret',
        )
        await user.click(screen.getByRole('button', { name: 'Save' }))

        await waitFor(() => {
            expect(receivedBody?.auth).toEqual({
                type: 'custom-scheme',
                location: 'header',
                key: 'Authorization',
                value: 'new-secret',
                scheme: 'Klaviyo-API-Key',
            })
        })
    })

    it('disables the Save button while the update request is in flight', async () => {
        let resolveUpdate: ((response: Response) => void) | undefined
        server.use(
            ...buildHandlers({
                onUpdate: () =>
                    new Promise<Response>((resolve) => {
                        resolveUpdate = resolve
                    }),
            }),
        )

        const { user } = renderComponent()

        await user.type(await screen.findByLabelText(/^Name/), '!')
        await user.type(screen.getByLabelText(/^Bearer token/), 'secret')

        const saveButton = screen.getByRole('button', { name: 'Save' })
        await user.click(saveButton)

        await waitFor(() => {
            expect(saveButton).toBeDisabled()
        })

        resolveUpdate?.(HttpResponse.json({ ...baseConnection }))

        expect(
            await screen.findByRole('status', {
                name: 'Credentials updated',
            }),
        ).toBeInTheDocument()
    })

    it('does not save when the Save button is disabled (no name, no auth value)', async () => {
        let updateCalled = false
        server.use(
            ...buildHandlers({
                onUpdate: () => {
                    updateCalled = true
                    return HttpResponse.json({ ...baseConnection })
                },
            }),
        )

        renderComponent()

        const saveButton = await screen.findByRole('button', { name: 'Save' })
        expect(saveButton).toBeDisabled()

        expect(updateCalled).toBe(false)
    })

    it('falls back to the connection name in the breadcrumb when the app title is empty', async () => {
        server.use(...buildHandlers({ appTitle: '' }))

        renderComponent()

        const appBreadcrumbLink = await screen.findByRole('link', {
            name: 'ShipMonk connection 1',
        })
        expect(appBreadcrumbLink).toHaveAttribute('href', APP_BASE_URL)
    })

    it('prompts to save unsaved changes when navigating away via a router Link', async () => {
        const { user } = renderComponent()

        const nameInput = await screen.findByLabelText(/^Name/)
        await user.type(nameInput, '!')

        await user.click(screen.getByRole('link', { name: 'Apps' }))

        expect(
            await screen.findByRole('button', { name: 'Back To Editing' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Discard Changes' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Save Changes' }),
        ).toBeInTheDocument()
    })
})
