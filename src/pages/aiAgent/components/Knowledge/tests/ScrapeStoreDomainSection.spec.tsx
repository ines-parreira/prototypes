import React from 'react'

import { fireEvent, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { billingState } from 'fixtures/billing'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useGetStoreDomainIngestionLog } from 'pages/aiAgent/hooks/useGetStoreDomainIngestionLog'
import history from 'pages/history'
import { assumeMock, mockStore, renderWithRouter } from 'utils/testing'

import { ScrapeStoreDomainSection } from '../ScrapeStoreDomainSection'

jest.mock('pages/aiAgent/hooks/useGetStoreDomainIngestionLog')
jest.mock('pages/aiAgent/hooks/useAiAgentNavigation')

const mockUseGetStoreDomainIngestionLog = assumeMock(
    useGetStoreDomainIngestionLog,
)
const mockUseAiAgentNavigation = assumeMock(useAiAgentNavigation)

const mockedShopName = 'test-shop'
const mockedShopDomain = 'test-shop.example.com'
const mockedHelpCenterId = 1
const mockedShopifyIntegration = {
    id: 1,
    type: 'shopify',
    meta: {
        shop_name: mockedShopName,
        shop_domain: mockedShopDomain,
    },
}
const defaultState = {
    integrations: fromJS({
        integrations: [mockedShopifyIntegration],
    }),
    billing: fromJS(billingState),
}
const mockedStore = mockStore(defaultState)
const renderComponent = () => {
    return renderWithRouter(
        <Provider store={mockedStore}>
            <ScrapeStoreDomainSection
                shopName={mockedShopName}
                helpCenterId={mockedHelpCenterId}
            />
        </Provider>,
    )
}

describe('ScrapeStoreDomainSection', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockUseGetStoreDomainIngestionLog.mockReturnValue({
            storeDomainIngestionLog: {
                id: 1,
                latest_sync: '2024-03-22T10:30:00Z',
            },
            isIngestionLogsLoading: false,
        } as unknown as ReturnType<typeof useGetStoreDomainIngestionLog>)
        mockUseAiAgentNavigation.mockReturnValue({
            routes: {
                pagesContent: '/pages-content',
            },
        } as unknown as ReturnType<typeof useAiAgentNavigation>)
    })

    it('should render the component correctly', () => {
        renderComponent()

        expect(screen.getByText('Your store domain')).toBeInTheDocument()
        expect(
            screen.getByText('AI Agent uses content from your store website.'),
        ).toBeInTheDocument()
        const domainLink = screen.getByText(mockedShopDomain)
        expect(domainLink).toBeInTheDocument()
        expect(domainLink.closest('a')).toHaveAttribute(
            'href',
            `https://${mockedShopDomain}`,
        )
        expect(screen.getByText('Last synced 03/22/24')).toBeInTheDocument()
        expect(screen.getByText('Sync')).toBeInTheDocument()
        expect(screen.getByText('Manage')).toBeInTheDocument()
    })

    it('should not render sync date if storeDomainIngestionLog is undefined', () => {
        mockUseGetStoreDomainIngestionLog.mockReturnValue({
            storeDomainIngestionLog: undefined,
            isIngestionLogsLoading: false,
        } as unknown as ReturnType<typeof useGetStoreDomainIngestionLog>)

        renderComponent()

        expect(screen.getByText('Your store domain')).toBeInTheDocument()
        expect(
            screen.getByText('AI Agent uses content from your store website.'),
        ).toBeInTheDocument()
        const domainLink = screen.getByText(mockedShopDomain)
        expect(domainLink).toBeInTheDocument()
        expect(domainLink.closest('a')).toHaveAttribute(
            'href',
            `https://${mockedShopDomain}`,
        )
        expect(
            screen.queryByText('Last synced 03/22/24'),
        ).not.toBeInTheDocument()
    })

    it('calls history.push when Manage button is clicked', () => {
        renderComponent()

        fireEvent.click(screen.getByText('Manage'))
        expect(history.push).toHaveBeenCalledWith('/pages-content')
    })
})
