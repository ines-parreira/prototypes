import React, { useEffect } from 'react'

import { logPageChange } from '@repo/logging'
import {
    Redirect,
    Route,
    Switch,
    useLocation,
    useRouteMatch,
} from 'react-router-dom'

import { DefaultStatsFilters } from 'domains/reporting/pages/DefaultStatsFilters'
import { ProtectedRoute } from 'domains/reporting/pages/report-chart-restrictions/ProtectedRoute'
import { VoiceOfCustomerNavbarContainer } from 'domains/reporting/pages/voice-of-customer/components/VoiceOfCustomerNavbarContainer/VoiceOfCustomerNavbarContainer'
import { ProductInsightsPage } from 'domains/reporting/pages/voice-of-customer/product-insights/ProductInsightsPage'
import { DefaultExportLegacyPage as LegacyPage } from 'pages/LegacyPage'
import { VOICE_OF_CUSTOMER_ROUTES } from 'routes/constants'

export const VoiceOfCustomerRoutes = () => {
    const location = useLocation()
    const { path } = useRouteMatch()

    useEffect(logPageChange, [location.pathname])

    return (
        <DefaultStatsFilters
            notReadyFallback={
                <Route
                    render={() => (
                        <LegacyPage navbar={VoiceOfCustomerNavbarContainer}>
                            {null}
                        </LegacyPage>
                    )}
                />
            }
        >
            <Switch>
                <Route exact path={`${path}/`}>
                    <Redirect
                        to={`${path}/${VOICE_OF_CUSTOMER_ROUTES.PRODUCT_INSIGHTS}`}
                    />
                </Route>

                <ProtectedRoute
                    path={`${path}/${VOICE_OF_CUSTOMER_ROUTES.PRODUCT_INSIGHTS}`}
                >
                    <Route
                        exact
                        path={`${path}/${VOICE_OF_CUSTOMER_ROUTES.PRODUCT_INSIGHTS}`}
                        render={() => (
                            <LegacyPage
                                content={ProductInsightsPage}
                                navbar={VoiceOfCustomerNavbarContainer}
                            />
                        )}
                    />
                </ProtectedRoute>
            </Switch>
        </DefaultStatsFilters>
    )
}
