import { MockSidebarProvider } from '@repo/navigation/fixtures'
import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { IntegrationType } from 'models/integration/types'
import type { GorgiasChatIntegration } from 'models/integration/types'
import { useIsConvertSubscriber } from 'pages/common/hooks/useIsConvertSubscriber'
import { useGetOnboardingStatusMap } from 'pages/convert/channelConnections/hooks/useGetOnboardingStatusMap'
import useCanAddContactFormFlag from 'pages/convert/common/hooks/useContactFormFlag'
import { useGetSortedIntegrations } from 'pages/convert/common/hooks/useGetSortedIntegrations'

import { ConvertSidebar } from '../sidebars/ConvertSidebar/ConvertSidebar'

jest.mock('pages/common/hooks/useIsConvertSubscriber', () => ({
    useIsConvertSubscriber: jest.fn(),
}))

jest.mock(
    'pages/convert/channelConnections/hooks/useGetOnboardingStatusMap',
    () => ({
        useGetOnboardingStatusMap: jest.fn(),
    }),
)

jest.mock('pages/convert/common/hooks/useContactFormFlag', () => ({
    __esModule: true,
    default: jest.fn(),
}))

jest.mock('pages/convert/common/hooks/useGetSortedIntegrations', () => ({
    useGetSortedIntegrations: jest.fn(),
}))

const mockUseIsConvertSubscriber = assumeMock(useIsConvertSubscriber)
const mockUseGetOnboardingStatusMap = assumeMock(useGetOnboardingStatusMap)
const mockUseCanAddContactFormFlag = assumeMock(useCanAddContactFormFlag)
const mockUseGetSortedIntegrations = assumeMock(useGetSortedIntegrations)

const mockIntegration = {
    id: 1,
    name: 'My Store',
    type: IntegrationType.GorgiasChat,
    meta: {
        app_id: 'app-123',
        shop_integration_id: 10,
        shop_type: IntegrationType.Shopify,
        self_service: {},
    },
} as GorgiasChatIntegration

const renderConvertSidebar = (isCollapsed = false) =>
    render(
        <MemoryRouter>
            <MockSidebarProvider isCollapsed={isCollapsed}>
                <ConvertSidebar />
            </MockSidebarProvider>
        </MemoryRouter>,
    )

describe('ConvertSidebar', () => {
    beforeEach(() => {
        mockUseIsConvertSubscriber.mockReturnValue(true)
        mockUseCanAddContactFormFlag.mockReturnValue(false)
        mockUseGetOnboardingStatusMap.mockReturnValue({
            onboardingMap: { 'app-123': true },
            isLoading: false,
            isError: false,
        })
        mockUseGetSortedIntegrations.mockReturnValue([mockIntegration])
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders nothing when sidebar is collapsed', () => {
        const { container } = renderConvertSidebar(true)
        expect(container).toBeEmptyDOMElement()
    })

    it('renders Overview link when expanded', () => {
        renderConvertSidebar()
        expect(screen.getByText('Overview')).toBeInTheDocument()
    })

    it('shows Skeleton while loading', () => {
        mockUseGetOnboardingStatusMap.mockReturnValue({
            onboardingMap: {},
            isLoading: true,
            isError: false,
        })

        renderConvertSidebar()

        expect(screen.queryByText('Campaigns')).not.toBeInTheDocument()
        expect(screen.queryByText('My Store')).not.toBeInTheDocument()
    })

    it('shows only Overview on error', () => {
        mockUseGetOnboardingStatusMap.mockReturnValue({
            onboardingMap: {},
            isLoading: false,
            isError: true,
        })

        renderConvertSidebar()

        expect(screen.getByText('Overview')).toBeInTheDocument()
        expect(screen.queryByText('Campaigns')).not.toBeInTheDocument()
    })

    it('shows only Overview when there are no integrations', () => {
        mockUseGetSortedIntegrations.mockReturnValue([])

        renderConvertSidebar()

        expect(screen.getByText('Overview')).toBeInTheDocument()
        expect(screen.queryByText('Campaigns')).not.toBeInTheDocument()
    })

    it('shows Set up for a non-onboarded integration', () => {
        mockUseGetOnboardingStatusMap.mockReturnValue({
            onboardingMap: { 'app-123': false },
            isLoading: false,
            isError: false,
        })

        renderConvertSidebar()

        expect(screen.getByText('Set up')).toBeInTheDocument()
        expect(screen.queryByText('Campaigns')).not.toBeInTheDocument()
        expect(screen.queryByText('Click tracking')).not.toBeInTheDocument()
    })

    it('shows full menu items for an onboarded integration', () => {
        renderConvertSidebar()

        expect(screen.getByText('Campaigns')).toBeInTheDocument()
        expect(screen.getByText('Click tracking')).toBeInTheDocument()
    })

    it('shows Performance when the integration has a Shopify store', () => {
        renderConvertSidebar()
        expect(screen.getByText('Performance')).toBeInTheDocument()
    })

    it('does not show Performance when the integration has no store', () => {
        mockUseGetSortedIntegrations.mockReturnValue([
            {
                ...mockIntegration,
                meta: {
                    ...mockIntegration.meta,
                    shop_integration_id: null,
                },
            } as GorgiasChatIntegration,
        ])

        renderConvertSidebar()

        expect(screen.queryByText('Performance')).not.toBeInTheDocument()
    })

    it('shows upgrade icons for non-subscriber on Performance and Click tracking', () => {
        mockUseIsConvertSubscriber.mockReturnValue(false)

        renderConvertSidebar()

        expect(
            screen.getAllByRole('img', { name: 'arrow-circle-up' }).length,
        ).toBeGreaterThan(0)
    })

    it('does not show upgrade icons for a subscriber', () => {
        mockUseIsConvertSubscriber.mockReturnValue(true)

        renderConvertSidebar()

        expect(
            screen.queryByRole('img', { name: 'arrow-circle-up' }),
        ).not.toBeInTheDocument()
    })

    it('shows Settings when settingsEnabled is true', () => {
        mockUseCanAddContactFormFlag.mockReturnValue(true)

        renderConvertSidebar()

        expect(screen.getByText('Settings')).toBeInTheDocument()
        expect(screen.queryByText('Installation')).not.toBeInTheDocument()
    })

    it('shows Installation when settingsEnabled is false', () => {
        mockUseCanAddContactFormFlag.mockReturnValue(false)

        renderConvertSidebar()

        expect(screen.getByText('Installation')).toBeInTheDocument()
        expect(screen.queryByText('Settings')).not.toBeInTheDocument()
    })
})
