import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'

import {
    getAudiencesLists,
    getAudiencesSegments,
} from '@gorgias/convert-client'

import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'

import { KlaviyoPermissionBanner } from './KlaviyoPermissionBanner'

jest.mock('@gorgias/convert-client', () => ({
    ...jest.requireActual('@gorgias/convert-client'),
    getAudiencesLists: jest.fn(),
    getAudiencesSegments: jest.fn(),
}))

jest.mock('rest_api/revenue_addon_api/client', () => ({
    getGorgiasRevenueAddonApiBaseUrl: jest.fn(),
}))

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({ push: mockHistoryPush }),
}))

const mockGetAudiencesLists = getAudiencesLists as jest.Mock
const mockGetAudiencesSegments = getAudiencesSegments as jest.Mock
const mockGetGorgiasRevenueAddonApiBaseUrl =
    getGorgiasRevenueAddonApiBaseUrl as jest.Mock

const okResponse = (audiences: { id: string; name: string }[] = []) => ({
    data: { data: audiences, links: null, permission_error: null },
})

const permissionErrorResponse = (scope: string | null) => ({
    data: {
        data: [],
        links: null,
        permission_error: {
            scope,
            message: scope
                ? `Your API key is missing required scopes: ${scope}`
                : 'Your API key is missing required scopes',
        },
    },
})

describe('<KlaviyoPermissionBanner />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockGetGorgiasRevenueAddonApiBaseUrl.mockReturnValue(
            'http://mocked-base-url',
        )
    })

    it('does not render when both queries succeed without permission errors', async () => {
        mockGetAudiencesLists.mockResolvedValue(okResponse())
        mockGetAudiencesSegments.mockResolvedValue(okResponse())

        render(
            <KlaviyoPermissionBanner
                integrationId={123}
                settingsUrl="/app/ai-journey/test-shop/settings/integrations"
            />,
        )

        await waitFor(() =>
            expect(mockGetAudiencesLists).toHaveBeenCalledTimes(1),
        )
        await waitFor(() =>
            expect(mockGetAudiencesSegments).toHaveBeenCalledTimes(1),
        )

        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
        expect(
            screen.queryByText(/Klaviyo .* are unavailable/),
        ).not.toBeInTheDocument()
    })

    it('does not render when integrationId is undefined (queries are idle)', async () => {
        render(
            <KlaviyoPermissionBanner
                integrationId={undefined}
                settingsUrl="/app/ai-journey/test-shop/settings/integrations"
            />,
        )

        expect(mockGetAudiencesLists).not.toHaveBeenCalled()
        expect(mockGetAudiencesSegments).not.toHaveBeenCalled()
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('renders the lists-only banner when only the lists scope is missing', async () => {
        mockGetAudiencesLists.mockResolvedValue(
            permissionErrorResponse('lists:read'),
        )
        mockGetAudiencesSegments.mockResolvedValue(okResponse())

        render(
            <KlaviyoPermissionBanner
                integrationId={123}
                settingsUrl="/app/ai-journey/test-shop/settings/integrations"
            />,
        )

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
        mockGetAudiencesLists.mockResolvedValue(okResponse())
        mockGetAudiencesSegments.mockResolvedValue(
            permissionErrorResponse('segments:read'),
        )

        render(
            <KlaviyoPermissionBanner
                integrationId={123}
                settingsUrl="/app/ai-journey/test-shop/settings/integrations"
            />,
        )

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
        mockGetAudiencesLists.mockResolvedValue(
            permissionErrorResponse('lists:read'),
        )
        mockGetAudiencesSegments.mockResolvedValue(
            permissionErrorResponse('segments:read'),
        )

        render(
            <KlaviyoPermissionBanner
                integrationId={123}
                settingsUrl="/app/ai-journey/test-shop/settings/integrations"
            />,
        )

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
        mockGetAudiencesLists.mockResolvedValue(permissionErrorResponse(null))
        mockGetAudiencesSegments.mockResolvedValue(okResponse())

        render(
            <KlaviyoPermissionBanner
                integrationId={123}
                settingsUrl="/app/ai-journey/test-shop/settings/integrations"
            />,
        )

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
        mockGetAudiencesLists.mockResolvedValue(
            permissionErrorResponse('lists:read'),
        )
        mockGetAudiencesSegments.mockResolvedValue(okResponse())

        const { user } = render(
            <KlaviyoPermissionBanner
                integrationId={123}
                settingsUrl="/app/ai-journey/test-shop/settings/integrations"
            />,
        )

        const cta = await screen.findByRole('link', {
            name: /open klaviyo settings/i,
        })
        await user.click(cta)

        expect(mockHistoryPush).toHaveBeenCalledWith(
            '/app/ai-journey/test-shop/settings/integrations',
        )
    })
})
