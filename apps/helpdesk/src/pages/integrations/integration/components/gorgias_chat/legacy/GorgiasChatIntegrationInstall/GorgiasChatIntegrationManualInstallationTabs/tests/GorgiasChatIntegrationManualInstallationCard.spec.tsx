import type React from 'react'

import { assumeMock } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { convertBundle } from 'fixtures/convertBundle'
import { useListBundles } from 'models/convert/bundle/queries'

import GorgiasChatIntegrationManualInstallationCard from '../../GorgiasChatIntegrationManualInstallationCard'

jest.mock('models/convert/bundle/queries')
assumeMock(useListBundles).mockReturnValue({
    data: [convertBundle],
} as any)

// Mock the queries
jest.mock('models/integration/queries', () => ({
    useGetInstallationSnippet: jest.fn().mockReturnValue({
        data: { snippet: 'test-snippet', appKey: 'test-app-key' },
    }),
}))

const queryClient = new QueryClient()

describe('GorgiasChatIntegrationManualInstallationCard', () => {
    const defaultProps = {
        integration: fromJS({ id: 1, meta: { shop_integration_id: 2 } }),
        applicationId: 'test-app-id',
        isConnected: false,
        isConnectedToShopify: false,
        isInstalledManually: false,
    }

    const renderWithQueryClient = (ui: React.ReactElement) => {
        return render(
            <QueryClientProvider client={queryClient}>
                {ui}
            </QueryClientProvider>,
        )
    }

    it('renders without crashing', () => {
        renderWithQueryClient(
            <GorgiasChatIntegrationManualInstallationCard {...defaultProps} />,
        )
        expect(screen.getByText('Manual installation')).toBeInTheDocument()
    })

    it('toggles collapse on header click', () => {
        renderWithQueryClient(
            <GorgiasChatIntegrationManualInstallationCard {...defaultProps} />,
        )
        const header = screen.getByText('Manual installation').closest('div')
        fireEvent.click(header!)
        expect(screen.getByText('keyboard_arrow_down')).toBeInTheDocument()
        fireEvent.click(header!)
        expect(screen.getByText('keyboard_arrow_up')).toBeInTheDocument()
    })

    it('changes active tab on tab click', () => {
        renderWithQueryClient(
            <GorgiasChatIntegrationManualInstallationCard {...defaultProps} />,
        )
        fireEvent.click(screen.getByText('Google Tag Manager'))
        expect(
            screen.getByText(
                'Please note that if you install chat through Google Tag Managers, customers using ad-blockers might not be able to see your chat widget.',
            ),
        ).toBeInTheDocument()
    })
})
