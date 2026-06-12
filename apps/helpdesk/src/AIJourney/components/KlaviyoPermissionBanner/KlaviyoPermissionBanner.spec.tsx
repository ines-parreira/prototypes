import { render } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetAudiencesListsHandler,
    mockGetAudiencesListsResponse,
    mockGetAudiencesSegmentsHandler,
    mockGetAudiencesSegmentsResponse,
} from '@gorgias/convert-mocks'

import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { KlaviyoPermissionBanner } from './KlaviyoPermissionBanner'

jest.mock('rest_api/revenue_addon_api/client', () => ({
    getGorgiasRevenueAddonApiBaseUrl: jest.fn(),
}))

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({ push: mockHistoryPush }),
}))

const mockGetBaseUrl = getGorgiasRevenueAddonApiBaseUrl as jest.Mock
const server = setupServer()
let queryClient = mockQueryClient()

const okListsResponse = () =>
    mockGetAudiencesListsResponse({
        data: [],
        links: null,
        permission_error: null,
    })

const okSegmentsResponse = () =>
    mockGetAudiencesSegmentsResponse({
        data: [],
        links: null,
        permission_error: null,
    })

const permissionErrorResponse = (scope: string | null) => ({
    data: [],
    links: null,
    permission_error: {
        scope,
        message: scope
            ? `Your API key is missing required scopes: ${scope}`
            : 'Your API key is missing required scopes',
    },
})

const renderComponent = (integrationId: number | undefined = 123) => {
    queryClient = mockQueryClient()

    return render(
        <QueryClientProvider client={queryClient}>
            <KlaviyoPermissionBanner
                integrationId={integrationId}
                settingsUrl="/app/ai-journey/test-shop/settings/integrations"
            />
        </QueryClientProvider>,
    )
}

const useAudienceHandlers = ({
    lists = okListsResponse(),
    segments = okSegmentsResponse(),
}: {
    lists?: ReturnType<typeof okListsResponse>
    segments?: ReturnType<typeof okSegmentsResponse>
} = {}) => {
    const getAudiencesListsMock = mockGetAudiencesListsHandler(async () =>
        HttpResponse.json(lists),
    )
    const getAudiencesSegmentsMock = mockGetAudiencesSegmentsHandler(async () =>
        HttpResponse.json(segments),
    )

    server.use(getAudiencesListsMock.handler, getAudiencesSegmentsMock.handler)

    return {
        waitForGetAudiencesListsRequest:
            getAudiencesListsMock.waitForRequest(server),
        waitForGetAudiencesSegmentsRequest:
            getAudiencesSegmentsMock.waitForRequest(server),
    }
}

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    mockGetBaseUrl.mockReturnValue('http://mocked-base-url')
})

afterEach(() => {
    server.resetHandlers()
    queryClient.clear()
    jest.clearAllMocks()
})

afterAll(() => {
    server.close()
})

describe('<KlaviyoPermissionBanner />', () => {
    it('does not render when both queries succeed without permission errors', async () => {
        const {
            waitForGetAudiencesListsRequest,
            waitForGetAudiencesSegmentsRequest,
        } = useAudienceHandlers()

        renderComponent()

        await waitForGetAudiencesListsRequest()
        await waitForGetAudiencesSegmentsRequest()

        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
        expect(
            screen.queryByText(/Klaviyo .* are unavailable/),
        ).not.toBeInTheDocument()
    })

    it('does not render when integrationId is undefined because queries are idle', async () => {
        const requests: Request[] = []
        server.use(
            mockGetAudiencesListsHandler(async ({ request }) => {
                requests.push(request)

                return HttpResponse.json(okListsResponse())
            }).handler,
            mockGetAudiencesSegmentsHandler(async ({ request }) => {
                requests.push(request)

                return HttpResponse.json(okSegmentsResponse())
            }).handler,
        )

        renderComponent(undefined)

        expect(requests).toHaveLength(0)
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('renders the lists-only banner when only the lists scope is missing', async () => {
        useAudienceHandlers({
            lists: permissionErrorResponse('lists:read'),
        })

        renderComponent()

        expect(
            await screen.findByText('Klaviyo lists are unavailable'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Your Klaviyo API key is missing the lists:read scope. Reconnect Klaviyo with this scope to use Klaviyo lists here.',
            ),
        ).toBeInTheDocument()
    })

    it('renders the segments-only banner when only the segments scope is missing', async () => {
        useAudienceHandlers({
            segments: permissionErrorResponse('segments:read'),
        })

        renderComponent()

        expect(
            await screen.findByText('Klaviyo segments are unavailable'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Your Klaviyo API key is missing the segments:read scope. Reconnect Klaviyo with this scope to use Klaviyo segments here.',
            ),
        ).toBeInTheDocument()
    })

    it('renders the combined banner when both scopes are missing', async () => {
        useAudienceHandlers({
            lists: permissionErrorResponse('lists:read'),
            segments: permissionErrorResponse('segments:read'),
        })

        renderComponent()

        expect(
            await screen.findByText('Klaviyo audiences are unavailable'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Your Klaviyo API key is missing the lists:read and segments:read scopes. Reconnect Klaviyo with these scopes to use Klaviyo lists and segments here.',
            ),
        ).toBeInTheDocument()
    })

    it('falls back to a generic scope phrasing when the API does not return a scope name', async () => {
        useAudienceHandlers({
            lists: permissionErrorResponse(null),
        })

        renderComponent()

        expect(
            await screen.findByText('Klaviyo lists are unavailable'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Your Klaviyo API key is missing the required scope. Reconnect Klaviyo with this scope to use Klaviyo lists here.',
            ),
        ).toBeInTheDocument()
    })

    it('navigates to the Klaviyo settings list page when the CTA is clicked', async () => {
        useAudienceHandlers({
            lists: permissionErrorResponse('lists:read'),
        })

        const { user } = renderComponent()

        const cta = await screen.findByRole('link', {
            name: /open klaviyo settings/i,
        })
        await user.click(cta)

        expect(mockHistoryPush).toHaveBeenCalledWith(
            '/app/ai-journey/test-shop/settings/integrations',
        )
    })
})
