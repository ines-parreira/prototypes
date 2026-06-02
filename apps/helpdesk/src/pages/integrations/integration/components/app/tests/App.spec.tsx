import client from '@repo/api-resources'
import { featureFlagsClientMock } from '@repo/feature-flags/testing'
import { render } from '@repo/testing'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MockAdapter from 'axios-mock-adapter'
import { fromJS } from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { applications as mockApplications } from 'fixtures/applications'
import { dummyAppData } from 'fixtures/apps'
import type { Integration } from 'models/integration/types'
import { TrialPeriod } from 'models/integration/types/app'
import App, { Tab } from 'pages/integrations/integration/components/app/App'
import { DEFAULT_VALUES } from 'pages/integrations/mappers/mapDefaults'
import type { Application } from 'services/applications'
import { getApplicationById } from 'services/applications'
import type { RootState } from 'state/types'

const baseMockStore = configureMockStore([thunk])
const mockStore = (state: Record<string, unknown>) =>
    baseMockStore({
        billing: fromJS({ products: [] }),
        ...state,
    })
const store = mockStore({
    currentAccount: fromJS({ domain: '20-1 rpz' }),
    integrations: fromJS({ integrations: [] }),
})
const appId = '1234'
const mockServer = new MockAdapter(client)
jest.mock('services/applications', () => ({
    getApplicationById: jest.fn(),
}))

jest.mock('models/integration/resources', () => {
    const resources: {
        disconnectApp: unknown
    } = jest.requireActual('models/integration/resources')
    return {
        ...resources,
        disconnectApp: jest.fn((appId: 'success' | 'failure') =>
            Promise.resolve(appId === 'success' ? true : false),
        ),
    }
})

const mockCreateTrackstarServiceConnection = jest.fn()
jest.mock('models/workflows/queries', () => {
    const actual = jest.requireActual('models/workflows/queries')
    return {
        ...actual,
        useCreateTrackstarServiceConnection: () => ({
            mutateAsync: mockCreateTrackstarServiceConnection,
            isLoading: false,
        }),
    }
})

const mockTrackstarOpen = jest.fn()
let trackstarLinkCallbacks: {
    getLinkToken?: () => Promise<string>
    onSuccess?: (authCode: string) => void | Promise<void>
} = {}
jest.mock('@trackstar/react-trackstar-link', () => ({
    useTrackstarLink: jest.fn(
        (params: {
            getLinkToken?: () => Promise<string>
            onSuccess?: (authCode: string) => void | Promise<void>
        }) => {
            trackstarLinkCallbacks = params
            return { open: mockTrackstarOpen }
        },
    ),
}))
describe(`App`, () => {
    beforeEach(() => {
        mockServer.reset()
        mockTrackstarOpen.mockClear()
        mockCreateTrackstarServiceConnection.mockReset()
        trackstarLinkCallbacks = {}
    })
    it('should render', async () => {
        mockServer.onGet(`/api/apps/${appId}`).reply(200, dummyAppData)
        const { container } = render(<App />, {
            path: '/integrations/app/:appId',
            initialEntries: [`/integrations/app/${appId}`],
            storeState: store.getState() as object,
        })
        expect(container.firstChild).toMatchSnapshot()
        await screen.findAllByText(new RegExp(dummyAppData.name))
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should render in preview mode', async () => {
        mockServer.onGet(`/api/apps/${appId}`).reply((config) => {
            expect(config.params).toEqual({ preview: true })
            return [200, dummyAppData]
        })
        render(<App />, {
            path: '/integrations/app/:appId',
            initialEntries: [`/integrations/app/${appId}?preview=1`],
            storeState: store.getState() as object,
        })
        await screen.findAllByText(new RegExp(dummyAppData.name))
        expect(mockServer.history.get.length).toEqual(2)
    })
    it('should render the advanced tab', async () => {
        mockServer.onGet(`/api/apps/${appId}`).reply(200, dummyAppData)
        mockServer.onGet(`/api/async/errors`).reply(200, { data: [] })
        render(<App />, {
            path: '/integrations/app/:appId/:extra?',
            initialEntries: [`/integrations/app/${appId}/${Tab.Advanced}`],
            storeState: store.getState() as object,
        })
        await waitFor(() => {
            expect(screen.getByText('Granted permissions')).toBeInTheDocument()
        })
    })
    it('should render the credentials tab when there are connected integrations', async () => {
        mockServer
            .onGet(`/api/apps/${appId}`)
            .reply(200, { ...dummyAppData, is_installed: true })
        mockServer.onGet(`/api/async/errors`).reply(200, { data: [] })
        const store = mockStore({
            integrations: fromJS({
                currentAccount: fromJS({ domain: '20-1 rpz' }),
                integrations: [
                    {
                        id: 1,
                        type: 'app',
                        application_id: '1234',
                        name: 'my app',
                        meta: { address: '@myapp' },
                    } as Integration,
                ],
            }),
        } as unknown as RootState)
        render(<App />, {
            path: '/integrations/app/:appId/:extra?',
            initialEntries: [`/integrations/app/${appId}/${Tab.Credentials}`],
            storeState: store.getState() as object,
        })
        await screen.findAllByText(new RegExp(dummyAppData.name))
        expect(screen.getByText('App Details')).toBeDefined()
        expect(screen.getByText('Advanced')).toBeDefined()
        expect(screen.getByText('Credentials')).toBeDefined()
    })
    it('should render the credentials tab with the button add connection for apps that support multiple connections', async () => {
        mockServer
            .onGet(`/api/apps/${appId}`)
            .reply(200, { ...dummyAppData, is_installed: true })
        mockServer.onGet(`/api/async/errors`).reply(200, { data: [] })
        const mockedGetApplicationById =
            getApplicationById as jest.Mock<Application>
        const application = mockApplications[0]
        application.id = appId
        application.supports_multiple_connections = true
        mockedGetApplicationById.mockReturnValue(application)
        const store = mockStore({
            integrations: fromJS({
                currentAccount: fromJS({ domain: '20-1 rpz' }),
                integrations: [
                    {
                        id: 1,
                        type: 'app',
                        application_id: '1234',
                        name: 'my app',
                        meta: { address: '@myapp' },
                    } as Integration,
                ],
            }),
        } as unknown as RootState)
        render(<App />, {
            path: '/integrations/app/:appId/:extra?',
            initialEntries: [`/integrations/app/${appId}/${Tab.Credentials}`],
            storeState: store.getState() as object,
        })
        await screen.findAllByText(new RegExp(dummyAppData.name))
        expect(screen.getByText('Add credentials')).toBeDefined()
    })
    it('should not render the credentials tab with no integrations', async () => {
        mockServer
            .onGet(`/api/apps/${appId}`)
            .reply(200, { ...dummyAppData, is_installed: true })
        mockServer.onGet(`/api/async/errors`).reply(200, { data: [] })
        render(<App />, {
            path: '/integrations/app/:appId/:extra?',
            initialEntries: [`/integrations/app/${appId}/${Tab.Advanced}`],
            storeState: store.getState() as object,
        })
        await screen.findAllByText(new RegExp(dummyAppData.name))
        expect(screen.queryByText('App Details')).not.toBeNull()
        expect(screen.queryByText('Advanced')).not.toBeNull()
        expect(screen.queryByText('Credentials')).toBeNull()
    })
    it('should have a functionnal disconnect flow', async () => {
        mockServer
            .onGet(`/api/apps/${appId}`)
            .replyOnce(200, {
                ...dummyAppData,
                id: 'success',
                is_installed: true,
            })
            .onGet(`/api/apps/${appId}`)
            .reply(200, { ...dummyAppData, id: 'success', is_installed: false })
        render(<App />, {
            path: '/integrations/app/:appId',
            initialEntries: [`/integrations/app/${appId}`],
            storeState: store.getState() as object,
        })
        await screen.findAllByText(new RegExp(dummyAppData.name))
        fireEvent.click(screen.getByRole('button', { name: 'Disconnect App' }))
        await waitFor(() => screen.getByRole('button', { name: 'Disconnect' }))
        fireEvent.click(screen.getByRole('button', { name: 'Disconnect' }))
        await waitFor(() => {
            expect(
                screen.queryByRole('button', { name: 'Connect App' }),
            ).toBeTruthy()
        })
        const toast = await screen.findByRole('status', {
            name: `${dummyAppData.name} has been disconnected.`,
        })
        expect(toast).toHaveAttribute('data-intent', 'success')
    })
    it('should have a failed disconnection flow', async () => {
        mockServer
            .onGet(`/api/apps/${appId}`)
            .reply(200, { ...dummyAppData, id: 'failure', is_installed: true })
        render(<App />, {
            path: '/integrations/app/:appId',
            initialEntries: [`/integrations/app/${appId}`],
            storeState: store.getState() as object,
        })
        await screen.findAllByText(new RegExp(dummyAppData.name))
        fireEvent.click(screen.getByRole('button', { name: 'Disconnect App' }))
        await waitFor(() => screen.getByRole('button', { name: 'Disconnect' }))
        fireEvent.click(screen.getByRole('button', { name: 'Disconnect' }))
        await waitFor(() => {
            expect(
                screen.queryByRole('button', { name: 'Connect App' }),
            ).toBeFalsy()
        })
        const toast = await screen.findByRole('status', {
            name: `Sorry, something went wrong. ${dummyAppData.name} is still connected.`,
        })
        expect(toast).toHaveAttribute('data-intent', 'destructive')
    })
    it('should display a warning with the right text', async () => {
        mockServer
            .onGet(`/api/apps/${appId}`)
            .reply(200, { ...dummyAppData, is_unapproved: true })
        render(<App />, {
            path: '/integrations/app/:appId',
            initialEntries: [`/integrations/app/${appId}`],
            storeState: store.getState() as object,
        })
        await screen.findAllByText(new RegExp(dummyAppData.name))
        expect(screen.getByText(/has not been approved/))
    })
    it('should display specific tags', async () => {
        mockServer.onGet(`/api/apps/${appId}`).reply(200, {
            ...dummyAppData,
            has_free_trial: true,
            free_trial_period: TrialPeriod.FOURTEEN,
        })
        render(<App />, {
            path: '/integrations/app/:appId',
            initialEntries: [`/integrations/app/${appId}`],
            storeState: store.getState() as object,
        })
        await screen.findAllByText(new RegExp(dummyAppData.name))
        expect(screen.getByText('14 DAYS FREE TRIAL'))
    })
    it('should display defaults if config is unapproved and missing fields', async () => {
        mockServer.onGet(`/api/apps/${appId}`).reply(200, {
            ...dummyAppData,
            is_unapproved: true,
            name: null,
        })
        render(<App />, {
            path: '/integrations/app/:appId',
            initialEntries: [`/integrations/app/${appId}`],
            storeState: store.getState() as object,
        })
        await screen.findByText(new RegExp(DEFAULT_VALUES.title))
    })
    it('disables the disconnect button and shows tooltip when app has connections and supports multiple connections', async () => {
        mockServer.onGet(`/api/apps/${appId}`).reply(200, {
            ...dummyAppData,
            is_installed: true,
            supports_multiple_connections: true,
            id: appId,
        })
        jest.mock('services/applications', () => ({
            getApplicationById: jest.fn(),
        }))
        const mockedGetApplicationById =
            getApplicationById as jest.Mock<Application>
        mockedGetApplicationById.mockReturnValue({
            ...mockApplications[0],
            supports_multiple_connections: true,
            id: appId,
        })
        const integrationsStore = mockStore({
            integrations: fromJS({
                integrations: [
                    {
                        id: 1,
                        type: 'app',
                        application_id: appId,
                        name: 'my app',
                        meta: { address: '@myapp' },
                    } as Integration,
                ],
            }),
        } as unknown as RootState)
        const { getByRole } = render(<App />, {
            path: '/integrations/app/:appId',
            initialEntries: [`/integrations/app/${appId}`],
            storeState: integrationsStore.getState() as object,
        })
        await screen.findAllByText(new RegExp(dummyAppData.name))
        const disconnectButton = getByRole('button', { name: 'Disconnect App' })
        expect(disconnectButton).toBeAriaDisabled()
    })
    it('Shows error banner if supports multilple connections and no connections found', async () => {
        mockServer.onGet(`/api/apps/${appId}`).reply(200, {
            ...dummyAppData,
            is_installed: true,
            supports_multiple_connections: true,
            id: appId,
        })
        jest.mock('services/applications', () => ({
            getApplicationById: jest.fn(),
        }))
        const mockedGetApplicationById =
            getApplicationById as jest.Mock<Application>
        mockedGetApplicationById.mockReturnValue({
            ...mockApplications[0],
            supports_multiple_connections: true,
            id: appId,
        })
        const integrationsStore = mockStore({
            integrations: fromJS({
                integrations: [],
            }),
        } as unknown as RootState)
        render(<App />, {
            path: '/integrations/app/:appId',
            initialEntries: [`/integrations/app/${appId}`],
            storeState: integrationsStore.getState() as object,
        })
        await screen.findAllByText(
            'This app doesn’t have any connected accounts yet, reconnect the app to start using it. If you still see this message contact our support to help you.',
        )
    })

    describe('Actions tab (ActionCentralizedLibrary FF)', () => {
        afterEach(() => {
            featureFlagsClientMock.allFlags.mockReturnValue({})
        })

        it('does not render the Actions link when the FF is off', async () => {
            mockServer
                .onGet(`/api/apps/${appId}`)
                .reply(200, { ...dummyAppData, is_installed: true })
            mockServer.onGet(`/api/async/errors`).reply(200, { data: [] })
            featureFlagsClientMock.allFlags.mockReturnValue({
                'action-centralized-library': 'OFF',
            })
            render(<App />, {
                path: '/integrations/app/:appId/:extra?',
                initialEntries: [`/integrations/app/${appId}`],
                storeState: store.getState() as object,
            })
            await screen.findAllByText(new RegExp(dummyAppData.name))
            expect(screen.queryByRole('link', { name: 'Actions' })).toBeNull()
        })

        it('renders the Actions link in the SecondaryNavbar when the FF is on', async () => {
            mockServer
                .onGet(`/api/apps/${appId}`)
                .reply(200, { ...dummyAppData, is_installed: true })
            mockServer.onGet(`/api/async/errors`).reply(200, { data: [] })
            featureFlagsClientMock.allFlags.mockReturnValue({
                'action-centralized-library': 'MILESTONE-1',
            })
            render(<App />, {
                path: '/integrations/app/:appId/:extra?',
                initialEntries: [`/integrations/app/${appId}`],
                storeState: store.getState() as object,
            })
            await screen.findAllByText(new RegExp(dummyAppData.name))
            expect(
                await screen.findByRole('link', { name: 'Actions' }),
            ).toBeInTheDocument()
        })

        it('shows the Credentials link when the FF is on and the app has service connections', async () => {
            mockServer
                .onGet(`/api/apps/${appId}`)
                .reply(200, { ...dummyAppData, id: appId, is_installed: true })
            mockServer.onGet(`/api/async/errors`).reply(200, { data: [] })
            mockServer.onGet('/api/service-connections/').reply(200, {
                data: [
                    {
                        id: '01970000-0000-7000-8000-000000000001',
                        name: 'Test connection',
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
                    },
                ],
                meta: {},
            })
            const mockedGetApplicationById =
                getApplicationById as jest.Mock<Application>
            mockedGetApplicationById.mockReturnValue({
                ...mockApplications[0],
                id: appId,
                supports_multiple_connections: true,
            })
            featureFlagsClientMock.allFlags.mockReturnValue({
                'action-centralized-library': 'MILESTONE-1',
            })
            render(<App />, {
                path: '/integrations/app/:appId/:extra?',
                initialEntries: [
                    `/integrations/app/${appId}/${Tab.Credentials}`,
                ],
                storeState: store.getState() as object,
            })
            await screen.findAllByText(new RegExp(dummyAppData.name))
            expect(
                await screen.findByRole('link', { name: 'Credentials' }),
            ).toBeInTheDocument()
        })

        it('shows the Credentials link when the FF is on and the app is connected even without service connections', async () => {
            mockServer
                .onGet(`/api/apps/${appId}`)
                .reply(200, { ...dummyAppData, id: appId, is_installed: true })
            mockServer.onGet(`/api/async/errors`).reply(200, { data: [] })
            mockServer
                .onGet('/api/service-connections/')
                .reply(200, { data: [], meta: {} })
            const mockedGetApplicationById =
                getApplicationById as jest.Mock<Application>
            mockedGetApplicationById.mockReturnValue({
                ...mockApplications[0],
                id: appId,
                supports_multiple_connections: true,
            })
            featureFlagsClientMock.allFlags.mockReturnValue({
                'action-centralized-library': 'MILESTONE-1',
            })
            render(<App />, {
                path: '/integrations/app/:appId/:extra?',
                initialEntries: [`/integrations/app/${appId}`],
                storeState: store.getState() as object,
            })
            await screen.findAllByText(new RegExp(dummyAppData.name))
            await waitFor(() => {
                expect(
                    screen.queryByRole('link', { name: 'Credentials' }),
                ).toBeInTheDocument()
            })
        })

        it('renders the health-aware Connections content when the FF is on', async () => {
            const connectionId = '01970000-0000-7000-8000-000000000001'
            mockServer
                .onGet(`/api/apps/${appId}`)
                .reply(200, { ...dummyAppData, id: appId, is_installed: true })
            mockServer.onGet(`/api/async/errors`).reply(200, { data: [] })
            mockServer.onGet('/api/service-connections/').reply(200, {
                data: [
                    {
                        id: connectionId,
                        name: 'Test connection',
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
                    },
                ],
                meta: {},
            })
            mockServer
                .onGet(`/api/service-connections/${connectionId}/stores/`)
                .reply(200, { data: [], meta: {} })
            featureFlagsClientMock.allFlags.mockReturnValue({
                'action-centralized-library': 'MILESTONE-1',
            })
            const integrationsStore = mockStore({
                currentAccount: fromJS({ domain: '20-1 rpz' }),
                integrations: fromJS({
                    integrations: [
                        {
                            id: 1,
                            type: 'app',
                            application_id: appId,
                            name: 'My account',
                            meta: { address: '@myapp' },
                        } as Integration,
                    ],
                }),
            } as unknown as RootState)
            render(<App />, {
                path: '/integrations/app/:appId/:extra?',
                initialEntries: [
                    `/integrations/app/${appId}/${Tab.Credentials}`,
                ],
                storeState: integrationsStore.getState() as object,
            })
            expect(await screen.findByText('Active')).toBeInTheDocument()
        })

        it('renders the "Add connection" button on the Credentials tab when the FF is on', async () => {
            mockServer
                .onGet(`/api/apps/${appId}`)
                .reply(200, { ...dummyAppData, id: appId, is_installed: true })
            mockServer.onGet(`/api/async/errors`).reply(200, { data: [] })
            mockServer.onGet('/api/service-connections/').reply(200, {
                data: [
                    {
                        id: '01970000-0000-7000-8000-000000000001',
                        name: 'Test connection',
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
                    },
                ],
                meta: {},
            })
            mockServer
                .onGet(
                    '/api/service-connections/01970000-0000-7000-8000-000000000001/stores/',
                )
                .reply(200, { data: [], meta: {} })
            featureFlagsClientMock.allFlags.mockReturnValue({
                'action-centralized-library': 'MILESTONE-1',
            })

            render(<App />, {
                path: '/integrations/app/:appId/:extra?',
                initialEntries: [
                    `/integrations/app/${appId}/${Tab.Credentials}`,
                ],
                storeState: store.getState() as object,
            })

            expect(
                await screen.findByRole('button', { name: 'Add credentials' }),
            ).toBeInTheDocument()
        })

        it('opens the auth modal when "Add connection" is clicked on the Credentials tab with outbound auth', async () => {
            const user = userEvent.setup()
            mockServer.onGet(`/api/apps/${appId}`).reply(200, {
                ...dummyAppData,
                id: appId,
                is_installed: true,
                outbound_auth: {
                    type: 'api-key',
                    url: 'https://api.shipmonk.com',
                    setup_description: '',
                    location: 'header',
                    key: 'X-Api-Key',
                    vendor: null,
                },
            })
            mockServer.onGet(`/api/async/errors`).reply(200, { data: [] })
            mockServer.onGet('/api/service-connections/').reply(200, {
                data: [
                    {
                        id: '01970000-0000-7000-8000-000000000001',
                        name: 'Existing connection',
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
                    },
                ],
                meta: {},
            })
            mockServer
                .onGet(
                    '/api/service-connections/01970000-0000-7000-8000-000000000001/stores/',
                )
                .reply(200, { data: [], meta: {} })
            featureFlagsClientMock.allFlags.mockReturnValue({
                'action-centralized-library': 'MILESTONE-1',
            })

            render(<App />, {
                path: '/integrations/app/:appId/:extra?',
                initialEntries: [
                    `/integrations/app/${appId}/${Tab.Credentials}`,
                ],
                storeState: store.getState() as object,
            })

            await user.click(
                await screen.findByRole('button', { name: 'Add credentials' }),
            )

            expect(
                await screen.findByRole('dialog', {
                    name: new RegExp(`Connect ${dummyAppData.name}`),
                }),
            ).toBeInTheDocument()
        })

        it('POSTs the connection payload when the user submits the auth modal', async () => {
            const user = userEvent.setup()
            const connectionId = '01970000-0000-7000-8000-000000000099'
            const outboundAuth = {
                type: 'api-key' as const,
                url: 'https://api.shipmonk.com',
                setup_description: '',
                location: 'header' as const,
                key: 'X-Api-Key',
                vendor: null,
            }
            mockServer.onGet(`/api/apps/${appId}`).reply(200, {
                ...dummyAppData,
                id: appId,
                is_installed: true,
                outbound_auth: outboundAuth,
            })
            mockServer
                .onGet('/api/service-connections/')
                .reply(200, { data: [], meta: {} })
            mockServer.onGet(`/api/async/errors`).reply(200, { data: [] })

            let capturedPayload: unknown = null
            mockServer.onPost('/api/service-connections/').reply((config) => {
                capturedPayload = JSON.parse(config.data)
                return [
                    200,
                    {
                        id: connectionId,
                        name: dummyAppData.name,
                        service: 'my-test-app',
                        url: outboundAuth.url,
                        status: 'active',
                        created_datetime: '2026-05-01T00:00:00',
                        updated_datetime: null,
                        trashed_datetime: null,
                        created_by: 1,
                        updated_by: null,
                        trashed_by: null,
                        external_id: null,
                        vendor: null,
                    },
                ]
            })

            featureFlagsClientMock.allFlags.mockReturnValue({
                'action-centralized-library': 'MILESTONE-1',
            })

            render(<App />, {
                path: '/integrations/app/:appId',
                initialEntries: [`/integrations/app/${appId}`],
                storeState: store.getState() as object,
            })

            await user.click(
                await screen.findByRole('button', { name: 'Connect' }),
            )

            const dialog = await screen.findByRole('dialog', {
                name: new RegExp(`Connect ${dummyAppData.name}`),
            })
            await user.type(
                within(dialog).getByLabelText(/api key/i),
                'secret-token',
            )
            await user.click(
                within(dialog).getByRole('button', { name: 'Connect' }),
            )

            await waitFor(() => expect(capturedPayload).not.toBeNull())

            expect(capturedPayload).toEqual({
                name: dummyAppData.name,
                service: 'my-test-app',
                url: outboundAuth.url,
                auth: {
                    type: 'api-key',
                    location: 'header',
                    key: 'X-Api-Key',
                    value: 'secret-token',
                },
                application_id: appId,
                vendor: null,
            })
        })

        it('forwards the openchannel-provided scheme in the POST payload for custom-scheme auth', async () => {
            const user = userEvent.setup()
            const connectionId = '01970000-0000-7000-8000-000000000077'
            const outboundAuth = {
                type: 'custom-scheme' as const,
                url: 'https://a.klaviyo.com',
                setup_description: '',
                location: 'header' as const,
                key: 'Authorization',
                vendor: null,
                scheme: 'Klaviyo-API-Key',
            }
            mockServer.onGet(`/api/apps/${appId}`).reply(200, {
                ...dummyAppData,
                id: appId,
                is_installed: true,
                outbound_auth: outboundAuth,
            })
            mockServer
                .onGet('/api/service-connections/')
                .reply(200, { data: [], meta: {} })
            mockServer.onGet(`/api/async/errors`).reply(200, { data: [] })

            let capturedPayload: unknown = null
            mockServer.onPost('/api/service-connections/').reply((config) => {
                capturedPayload = JSON.parse(config.data)
                return [
                    200,
                    {
                        id: connectionId,
                        name: dummyAppData.name,
                        service: 'my-test-app',
                        url: outboundAuth.url,
                        status: 'active',
                        created_datetime: '2026-05-01T00:00:00',
                        updated_datetime: null,
                        trashed_datetime: null,
                        created_by: 1,
                        updated_by: null,
                        trashed_by: null,
                        external_id: null,
                        vendor: null,
                    },
                ]
            })

            featureFlagsClientMock.allFlags.mockReturnValue({
                'action-centralized-library': 'MILESTONE-1',
            })

            render(<App />, {
                path: '/integrations/app/:appId',
                initialEntries: [`/integrations/app/${appId}`],
                storeState: store.getState() as object,
            })

            await user.click(
                await screen.findByRole('button', { name: 'Connect' }),
            )

            const dialog = await screen.findByRole('dialog', {
                name: new RegExp(`Connect ${dummyAppData.name}`),
            })
            await user.type(
                within(dialog).getByLabelText('Klaviyo-API-Key'),
                'klaviyo-secret',
            )
            await user.click(
                within(dialog).getByRole('button', { name: 'Connect' }),
            )

            await waitFor(() => expect(capturedPayload).not.toBeNull())

            expect(capturedPayload).toEqual({
                name: dummyAppData.name,
                service: 'my-test-app',
                url: outboundAuth.url,
                auth: {
                    type: 'custom-scheme',
                    location: 'header',
                    key: 'Authorization',
                    value: 'klaviyo-secret',
                    scheme: 'Klaviyo-API-Key',
                },
                application_id: appId,
                vendor: null,
            })
        })

        it('encodes basic-auth credentials as username:password in the POST payload', async () => {
            const user = userEvent.setup()
            const connectionId = '01970000-0000-7000-8000-000000000088'
            const outboundAuth = {
                type: 'basic' as const,
                url: 'https://api.shipmonk.com',
                setup_description: '',
                location: 'header' as const,
                key: 'Authorization',
                vendor: null,
            }
            mockServer.onGet(`/api/apps/${appId}`).reply(200, {
                ...dummyAppData,
                id: appId,
                is_installed: true,
                outbound_auth: outboundAuth,
            })
            mockServer
                .onGet('/api/service-connections/')
                .reply(200, { data: [], meta: {} })
            mockServer.onGet(`/api/async/errors`).reply(200, { data: [] })

            let capturedPayload: unknown = null
            mockServer.onPost('/api/service-connections/').reply((config) => {
                capturedPayload = JSON.parse(config.data)
                return [
                    200,
                    {
                        id: connectionId,
                        name: dummyAppData.name,
                        service: 'my-test-app',
                        url: outboundAuth.url,
                        status: 'active',
                        created_datetime: '2026-05-01T00:00:00',
                        updated_datetime: null,
                        trashed_datetime: null,
                        created_by: 1,
                        updated_by: null,
                        trashed_by: null,
                        external_id: null,
                        vendor: null,
                    },
                ]
            })

            featureFlagsClientMock.allFlags.mockReturnValue({
                'action-centralized-library': 'MILESTONE-1',
            })

            render(<App />, {
                path: '/integrations/app/:appId',
                initialEntries: [`/integrations/app/${appId}`],
                storeState: store.getState() as object,
            })

            await user.click(
                await screen.findByRole('button', { name: 'Connect' }),
            )

            const dialog = await screen.findByRole('dialog', {
                name: new RegExp(`Connect ${dummyAppData.name}`),
            })
            await user.type(within(dialog).getByLabelText(/username/i), 'alice')
            await user.type(
                within(dialog).getByLabelText(/password/i),
                'hunter2',
            )
            await user.click(
                within(dialog).getByRole('button', { name: 'Connect' }),
            )

            await waitFor(() => expect(capturedPayload).not.toBeNull())
            expect(capturedPayload).toEqual(
                expect.objectContaining({
                    auth: expect.objectContaining({ value: 'alice:hunter2' }),
                }),
            )
        })

        it('keeps the legacy IntegrationsList in the Credentials tab when the FF is off', async () => {
            mockServer
                .onGet(`/api/apps/${appId}`)
                .reply(200, { ...dummyAppData, id: appId, is_installed: true })
            mockServer.onGet(`/api/async/errors`).reply(200, { data: [] })
            featureFlagsClientMock.allFlags.mockReturnValue({
                'action-centralized-library': 'OFF',
            })
            const integrationsStore = mockStore({
                currentAccount: fromJS({ domain: '20-1 rpz' }),
                integrations: fromJS({
                    integrations: [
                        {
                            id: 1,
                            type: 'app',
                            application_id: appId,
                            name: 'My account',
                            meta: { address: '@myapp' },
                        } as Integration,
                    ],
                }),
            } as unknown as RootState)
            render(<App />, {
                path: '/integrations/app/:appId/:extra?',
                initialEntries: [
                    `/integrations/app/${appId}/${Tab.Credentials}`,
                ],
                storeState: integrationsStore.getState() as object,
            })
            await screen.findAllByText(new RegExp(dummyAppData.name))
            expect(screen.queryByText('Active')).not.toBeInTheDocument()
            expect(screen.queryByText('Action needed')).not.toBeInTheDocument()
        })
    })

    describe('Trackstar SetupCards flow (ActionCentralizedLibrary FF on)', () => {
        const trackstarOutboundAuth = {
            type: 'api-key' as const,
            url: 'https://api.shipmonk.com',
            setup_description: '',
            location: 'header' as const,
            key: 'X-Api-Key',
            vendor: 'trackstar' as const,
            trackstar_integration_name: 'shipmonk',
        }

        afterEach(() => {
            featureFlagsClientMock.allFlags.mockReturnValue({})
        })

        it('creates a Trackstar service connection when the auth code is received', async () => {
            const connectionId = '01970000-0000-7000-8000-000000000111'
            mockServer.onGet(`/api/apps/${appId}`).reply(200, {
                ...dummyAppData,
                id: appId,
                outbound_auth: trackstarOutboundAuth,
            })
            mockServer
                .onGet('/api/service-connections/')
                .reply(200, { data: [], meta: {} })
            mockServer.onGet(`/api/async/errors`).reply(200, { data: [] })

            mockCreateTrackstarServiceConnection.mockResolvedValue({
                data: { id: connectionId },
            })

            featureFlagsClientMock.allFlags.mockReturnValue({
                'action-centralized-library': 'MILESTONE-1',
            })

            render(<App />, {
                path: '/integrations/app/:appId',
                initialEntries: [`/integrations/app/${appId}`],
                storeState: store.getState() as object,
            })

            await screen.findAllByText(new RegExp(dummyAppData.name))
            expect(
                screen.getByRole('heading', {
                    name: `Let Gorgias take action in ${dummyAppData.name}`,
                }),
            ).toBeInTheDocument()

            await trackstarLinkCallbacks.onSuccess?.('trackstar-auth-xyz')

            await waitFor(() => {
                expect(
                    mockCreateTrackstarServiceConnection,
                ).toHaveBeenCalledWith([
                    null,
                    { auth_code: 'trackstar-auth-xyz' },
                ])
            })
        })

        it('shows an error toast when the Trackstar service-connection request fails', async () => {
            mockServer.onGet(`/api/apps/${appId}`).reply(200, {
                ...dummyAppData,
                id: appId,
                outbound_auth: trackstarOutboundAuth,
            })
            mockServer
                .onGet('/api/service-connections/')
                .reply(200, { data: [], meta: {} })
            mockServer.onGet(`/api/async/errors`).reply(200, { data: [] })

            mockCreateTrackstarServiceConnection.mockRejectedValue(
                new Error('boom'),
            )

            featureFlagsClientMock.allFlags.mockReturnValue({
                'action-centralized-library': 'MILESTONE-1',
            })

            render(<App />, {
                path: '/integrations/app/:appId',
                initialEntries: [`/integrations/app/${appId}`],
                storeState: store.getState() as object,
            })

            await screen.findAllByText(new RegExp(dummyAppData.name))
            await trackstarLinkCallbacks.onSuccess?.('trackstar-auth-xyz')

            const toast = await screen.findByRole('status', {
                name: new RegExp(
                    `Sorry, we couldn't connect ${dummyAppData.name}. Please try again\\.`,
                ),
            })
            expect(toast).toHaveAttribute('data-intent', 'destructive')
        })

        it('renders the Authorize inbound card when the app exposes a connectUrl but is not a Trackstar app', async () => {
            mockServer.onGet(`/api/apps/${appId}`).reply(200, {
                ...dummyAppData,
                id: appId,
                connect_url: 'https://shipmonk.example.com/install',
            })
            mockServer
                .onGet('/api/service-connections/')
                .reply(200, { data: [], meta: {} })
            mockServer.onGet(`/api/async/errors`).reply(200, { data: [] })

            featureFlagsClientMock.allFlags.mockReturnValue({
                'action-centralized-library': 'MILESTONE-1',
            })

            render(<App />, {
                path: '/integrations/app/:appId',
                initialEntries: [`/integrations/app/${appId}`],
                storeState: store.getState() as object,
            })

            expect(
                await screen.findByRole('heading', {
                    name: `Let ${dummyAppData.name} read your Gorgias data`,
                }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('link', { name: /Authorize/ }),
            ).toBeInTheDocument()
        })
    })
})
