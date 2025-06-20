import React, { useEffect } from 'react'

import {
    Redirect,
    Route,
    Switch,
    useLocation,
    useRouteMatch,
} from 'react-router-dom'

import { logPageChange } from 'common/segment'
import App from 'pages/App'
import DefaultStatsFilters from 'pages/stats/DefaultStatsFilters'
import { ProtectedRoute } from 'pages/stats/report-chart-restrictions/ProtectedRoute'
import { ProductInsightsPage } from 'pages/stats/voice-of-customer/product-insights/ProductInsightsPage'
import { VoiceOfCustomerNavbarContainer } from 'pages/stats/voice-of-customer/VoiceOfCustomerNavbarContainer'
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
                        <App navbar={VoiceOfCustomerNavbarContainer}>
                            {null}
                        </App>
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
                            <App
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
