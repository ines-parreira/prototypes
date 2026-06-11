import { render } from '@repo/testing'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { useTrackstarLink } from '@trackstar/react-trackstar-link'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockLinkTrackstarHandler,
    mockListTrackstarHandler,
    mockTokenTrackstarHandler,
} from '@gorgias/workflows-mocks'
import type { ListTrackstarConnectionsResponseItem } from '@gorgias/workflows-types'

import { StoreTrackstarProvider } from '../../../../../../aiAgent/actions/providers/StoreTrackstarProvider'
import { TrackstarConnectButton as ConnectTrackstarButton } from '../ConnectTrackstarButton'

jest.mock('@trackstar/react-trackstar-link')

const mockUseTrackstarLink = jest.mocked(useTrackstarLink)

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
    jest.clearAllMocks()
})

afterAll(() => {
    server.close()
})

const mockApp = {
    id: 'app-id',
    name: 'Test App',
}

const mockActionApp = {
    id: 'action-app-id',
    auth_type: 'trackstar',
    auth_settings: {
        integration_name: 'sandbox',
    },
} as const

const sandboxConnection: ListTrackstarConnectionsResponseItem = {
    account_id: 1,
    connection_id: 'sandbox_connection_id',
    error: false,
    integration_name: 'sandbox',
    store_name: 'acme',
    store_type: 'shopify',
}

const renderComponent = () =>
    render(
        <StoreTrackstarProvider storeName="test-store" storeType="shopify">
            <ConnectTrackstarButton
                app={mockApp as never}
                actionApp={mockActionApp}
            />
        </StoreTrackstarProvider>,
    )

describe('<ConnectTrackstarButton />', () => {
    beforeEach(() => {
        mockUseTrackstarLink.mockReturnValue({
            open: jest.fn(),
            error: null,
        } as unknown as ReturnType<typeof useTrackstarLink>)
    })

    it('renders connect button when no connection exists', async () => {
        server.use(
            mockListTrackstarHandler(async () => HttpResponse.json([])).handler,
        )

        renderComponent()

        expect(
            await screen.findByText(`Connect ${mockApp.name}`),
        ).toBeInTheDocument()
        expect(
            screen.getByText(/This step requires an active/),
        ).toBeInTheDocument()

        await waitFor(() => {
            expect(mockUseTrackstarLink).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    integrationAllowList: [
                        mockActionApp.auth_settings.integration_name,
                    ],
                }),
            )
        })
    })

    it('renders reconnect button when connection exists', async () => {
        server.use(
            mockListTrackstarHandler(async () =>
                HttpResponse.json([sandboxConnection]),
            ).handler,
        )

        renderComponent()

        expect(
            await screen.findByText(`Reconnect ${mockApp.name}`),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                `Your ${mockApp.name} account is already connected. Click the button below to reconnect your account.`,
            ),
        ).toBeInTheDocument()

        await waitFor(() => {
            expect(mockUseTrackstarLink).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    integrationAllowList: undefined,
                }),
            )
        })
    })

    it('opens Trackstar link on button click', async () => {
        const open = jest.fn()
        mockUseTrackstarLink.mockReturnValue({
            open,
            error: null,
        } as unknown as ReturnType<typeof useTrackstarLink>)
        server.use(
            mockListTrackstarHandler(async () => HttpResponse.json([])).handler,
        )

        renderComponent()

        fireEvent.click(await screen.findByText(`Connect ${mockApp.name}`))

        await waitFor(() => {
            expect(open).toHaveBeenCalled()
        })
    })

    it('creates token on successful authentication', async () => {
        const mockToken = mockTokenTrackstarHandler()
        server.use(
            mockListTrackstarHandler(async () => HttpResponse.json([])).handler,
            mockToken.handler,
        )
        const waitForTokenRequest = mockToken.waitForRequest(server)

        renderComponent()

        await screen.findByText(`Connect ${mockApp.name}`)

        const onSuccess = mockUseTrackstarLink.mock.calls.at(-1)![0].onSuccess
        await onSuccess('test-auth-code', 'sandbox')

        await waitForTokenRequest(async (request) => {
            const body = await request.json()
            expect(body).toEqual({
                auth_code: 'test-auth-code',
                store_name: 'test-store',
                store_type: 'shopify',
            })
        })
    })

    it('fetches link token when getLinkToken is called', async () => {
        const mockLink = mockLinkTrackstarHandler(async () =>
            HttpResponse.json({ link_token: 'test-link-token' }),
        )
        server.use(
            mockListTrackstarHandler(async () =>
                HttpResponse.json([sandboxConnection]),
            ).handler,
            mockLink.handler,
        )
        const waitForLinkRequest = mockLink.waitForRequest(server)

        renderComponent()

        await screen.findByText(`Reconnect ${mockApp.name}`)

        const getLinkToken =
            mockUseTrackstarLink.mock.calls.at(-1)![0].getLinkToken
        const result = await getLinkToken()

        await waitForLinkRequest(async (request) => {
            expect(request.url).toContain('sandbox_connection_id')
        })
        expect(result).toBe('test-link-token')
    })
})
