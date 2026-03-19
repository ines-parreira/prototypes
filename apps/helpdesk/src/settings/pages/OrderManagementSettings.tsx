import { Route, Switch, useRouteMatch } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/constants'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import OrderManagementPreviewProvider from 'pages/automate/orderManagement/legacy/OrderManagementPreviewProvider'
import { OrderManagementViewContainer } from 'pages/automate/orderManagement/OrderManagementViewContainer'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp'
import { useStoreSelector } from 'settings/automate'
import { getGorgiasChatIntegrationsByStoreName } from 'state/integrations/selectors'

import { AutomateSettingsChannelsRoute } from './flows-routes/AutomateSettingsFlowsChannelsRoute'
import { OrderManagementCancelRoute } from './order-management-routes/OrderManagementCancelRoute'
import { OrderManagementReportEditRoute } from './order-management-routes/OrderManagementReportEditRoute'
import { OrderManagementReportNewScenarioRoute } from './order-management-routes/OrderManagementReportNewScenarioRoute'
import { OrderManagementReportRoute } from './order-management-routes/OrderManagementReportRoute'
import { OrderManagementReturnRoute } from './order-management-routes/OrderManagementReturnRoute'
import { OrderManagementTrackRoute } from './order-management-routes/OrderManagementTrackRoute'
import { OrderManagementSettingsHeader } from './OrderManagementSettingsHeader'
import { OrderManagementSettingsLegacyHeader } from './OrderManagementSettingsLegacyHeader'

import css from './OrderManagementSettings.less'

export const BASE_PATH = '/app/settings/order-management'

export function OrderManagementSettings() {
    const { path } = useRouteMatch()
    const { selected } = useStoreSelector(BASE_PATH, [IntegrationType.Shopify])

    const selectedName = selected
        ? getShopNameFromStoreIntegration(selected)
        : undefined

    const chatIntegration = useAppSelector(
        getGorgiasChatIntegrationsByStoreName(selectedName ?? ''),
    )
    const chatId = chatIntegration?.id

    const { shouldShowScreensRevampWhenAiAgentEnabled } =
        useShouldShowChatSettingsRevamp(selected, chatId)

    const selectedPath = selected
        ? `${BASE_PATH}/${selected.type}/${selected.name}`
        : undefined

    return (
        <div className={css.container}>
            {shouldShowScreensRevampWhenAiAgentEnabled ? (
                <OrderManagementSettingsHeader />
            ) : (
                <OrderManagementSettingsLegacyHeader />
            )}

            {!!selected && !!selectedPath && (
                <OrderManagementPreviewProvider>
                    <Switch>
                        <Route exact path={path}>
                            <OrderManagementViewContainer />
                        </Route>
                        <Route
                            path={`${path}/track`}
                            component={OrderManagementTrackRoute}
                        />
                        <Route
                            path={`${path}/return`}
                            component={OrderManagementReturnRoute}
                        />
                        <Route
                            path={`${path}/cancel`}
                            component={OrderManagementCancelRoute}
                        />
                        <Route
                            path={`${path}/report-issue`}
                            exact
                            component={OrderManagementReportRoute}
                        />
                        <Route
                            path={`${path}/report-issue/new`}
                            exact
                            component={OrderManagementReportNewScenarioRoute}
                        />
                        <Route
                            path={`${path}/report-issue/:scenarioIndex`}
                            exact
                            component={OrderManagementReportEditRoute}
                        />
                        <Route path={`${path}/channels`}>
                            <AutomateSettingsChannelsRoute />
                        </Route>
                    </Switch>
                </OrderManagementPreviewProvider>
            )}
        </div>
    )
}
