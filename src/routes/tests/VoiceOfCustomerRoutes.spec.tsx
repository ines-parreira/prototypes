import React, { ComponentType } from 'react'

import { act, waitFor } from '@testing-library/react'
import { createBrowserHistory } from 'history'
import { Route, Switch } from 'react-router-dom'

import DefaultStatsFilters from 'pages/stats/DefaultStatsFilters'
import { ProtectedRoute } from 'pages/stats/report-chart-restrictions/ProtectedRoute'
import { ProductInsightsPage } from 'pages/stats/voice-of-customer/product-insights/ProductInsightsPage'
import { VoiceOfCustomerNavbarContainer } from 'pages/stats/voice-of-customer/VoiceOfCustomerNavbarContainer'
import { VOICE_OF_CUSTOMER_ROUTES } from 'routes/constants'
import { VoiceOfCustomerRoutes } from 'routes/VoiceOfCustomerRoutes'
import { assumeMock, renderWithRouter } from 'utils/testing'

jest.mock('pages/stats/voice-of-customer/VoiceOfCustomerNavbarContainer')
const VoiceOfCustomerNavbarContainerMock = assumeMock(
    VoiceOfCustomerNavbarContainer,
)
jest.mock('pages/stats/voice-of-customer/product-insights/ProductInsightsPage')
const ProductInsightsPageMock = assumeMock(ProductInsightsPage)
jest.mock('pages/stats/report-chart-restrictions/ProtectedRoute')
const ProtectedRouteMock = assumeMock(ProtectedRoute)
jest.mock('pages/stats/DefaultStatsFilters')
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
