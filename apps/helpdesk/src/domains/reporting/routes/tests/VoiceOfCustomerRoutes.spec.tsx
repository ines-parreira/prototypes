import type { ComponentType } from 'react'

import { assumeMock, render } from '@repo/testing'
import { waitFor } from '@testing-library/react'
import { Route, Switch } from 'react-router-dom'

import { DefaultStatsFilters } from 'domains/reporting/pages/DefaultStatsFilters'
import { ProtectedRoute } from 'domains/reporting/pages/report-chart-restrictions/ProtectedRoute'
import { VoiceOfCustomerNavbarContainer } from 'domains/reporting/pages/voice-of-customer/components/VoiceOfCustomerNavbarContainer/VoiceOfCustomerNavbarContainer'
import { ProductInsightsPage } from 'domains/reporting/pages/voice-of-customer/product-insights/ProductInsightsPage'
import { VoiceOfCustomerRoutes } from 'domains/reporting/routes/VoiceOfCustomerRoutes'
import { VOICE_OF_CUSTOMER_ROUTES } from 'routes/constants'

const routePrefix = '/voice-of-customer'

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
jest.mock('pages/LegacyPage', () => ({
    DefaultExportLegacyPage: ({
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
}))
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
    ])('should render %p page', async ({ route, mock }) => {
        render(
            <Switch>
                <Route path={routePrefix}>
                    <VoiceOfCustomerRoutes />
                </Route>
            </Switch>,
            { initialEntries: [`${routePrefix}/${route}`] },
        )

        await waitFor(() => {
            expect(mock).toHaveBeenCalled()
            expect(ProtectedRouteMock).toHaveBeenCalledWith(
                expect.objectContaining({ path: `${routePrefix}/${route}` }),
                {},
            )
        })
    })

    it('should render fallback', async () => {
        DefaultStatsFiltersMock.mockImplementation(({ notReadyFallback }) => (
            <div>{notReadyFallback}</div>
        ))

        render(
            <Switch>
                <Route path={routePrefix}>
                    <VoiceOfCustomerRoutes />
                </Route>
            </Switch>,
            { initialEntries: [routePrefix] },
        )

        await waitFor(() => {
            expect(VoiceOfCustomerNavbarContainerMock).toHaveBeenCalled()
        })
    })
})
