import { ComponentType } from 'react'

import { assumeMock } from '@repo/testing'
import { act, waitFor } from '@testing-library/react'
import { createBrowserHistory } from 'history'
import { Route, Switch } from 'react-router-dom'

import DefaultStatsFilters from 'domains/reporting/pages/DefaultStatsFilters'
import { ProtectedRoute } from 'domains/reporting/pages/report-chart-restrictions/ProtectedRoute'
import { VoiceOfCustomerNavbarContainer } from 'domains/reporting/pages/voice-of-customer/components/VoiceOfCustomerNavbarContainer/VoiceOfCustomerNavbarContainer'
import { ProductInsightsPage } from 'domains/reporting/pages/voice-of-customer/product-insights/ProductInsightsPage'
import { VoiceOfCustomerRoutes } from 'domains/reporting/routes/VoiceOfCustomerRoutes'
import { VOICE_OF_CUSTOMER_ROUTES } from 'routes/constants'
import { renderWithRouter } from 'utils/testing'

jest.mock(
    'domains/reporting/pages/voice-of-customer/components/VoiceOfCustomerNavbarContainer/VoiceOfCustomerNavbarContainer',
)
const VoiceOfCustomerNavbarContainerMock = assumeMock(
    VoiceOfCustomerNavbarContainer,
)
jest.mock(
    'domains/reporting/pages/voice-of-customer/product-insights/ProductInsightsPage',
)
const ProductInsightsPageMock = assumeMock(ProductInsightsPage)
jest.mock('domains/reporting/pages/report-chart-restrictions/ProtectedRoute')
const ProtectedRouteMock = assumeMock(ProtectedRoute)
jest.mock('domains/reporting/pages/DefaultStatsFilters')
const DefaultStatsFiltersMock = assumeMock(DefaultStatsFilters)
jest.mock(
    'pages/App',
    () =>
        ({
            content: Content,
            navbar: Navbar,
        }: {
            content?: ComponentType<any>
            navbar: ComponentType<any>
        }) => (
            <>
                <Navbar />
                {Content && <Content />}
            </>
        ),
)
const mockHistory = createBrowserHistory()

describe('VoiceOfCustomerRoutes', () => {
    beforeEach(() => {
        ProtectedRouteMock.mockImplementation(({ children }) => (
            <div>{children}</div>
        ))
        DefaultStatsFiltersMock.mockImplementation(({ children }) => (
            <div>{children}</div>
        ))
        VoiceOfCustomerNavbarContainerMock.mockImplementation(() => <div />)
        ProductInsightsPageMock.mockImplementation(() => <div />)
    })

    it.each([
        {
            route: `${VOICE_OF_CUSTOMER_ROUTES.PRODUCT_INSIGHTS}`,
            mock: ProductInsightsPageMock,
        },
    ])('should render %p page', ({ route, mock }) => {
        renderWithRouter(
            <Switch>
                <Route path={'/'}>
                    <VoiceOfCustomerRoutes />
                </Route>
            </Switch>,
        )

        act(() => mockHistory.push(`/${route}`))

        waitFor(() => {
            expect(mock).toHaveBeenCalled()
            expect(ProtectedRouteMock).toHaveBeenCalledWith(
                expect.objectContaining({ path: route }),
                {},
            )
        })
    })

    it('should render fallback', () => {
        DefaultStatsFiltersMock.mockImplementation(({ notReadyFallback }) => (
            <div>{notReadyFallback}</div>
        ))

        renderWithRouter(
            <Switch>
                <Route path={'/'}>
                    <VoiceOfCustomerRoutes />
                </Route>
            </Switch>,
        )

        waitFor(() => {
            expect(VoiceOfCustomerNavbarContainerMock).toHaveBeenCalled()
        })
    })
})
