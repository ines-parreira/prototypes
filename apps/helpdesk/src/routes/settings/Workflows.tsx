import { UserRole } from '@repo/utils'
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom'

import { PageSection } from 'config/pages'
import type { PaywallConfig } from 'config/paywalls'
import { paywallConfigs as defaultPaywallConfigs } from 'config/paywalls'
import { OBJECT_TYPES } from 'custom-fields/constants'
import AutoMergeSettings from 'pages/settings/autoMerge/AutoMergeSettings'
import SatisfactionSurveyView from 'pages/settings/satisfactionSurveys/SatisfactionSurveyView'
import ManageTags from 'pages/settings/tags/ManageTags'
import TicketAssignment from 'pages/settings/ticketAssignment/TicketAssignment'
import {
    workflowsRoutes as routes,
    WorkflowsRoute,
} from 'routes/layout/products/workflows'
import { AutomatePaywall } from 'settings/automate'
import {
    ArticleRecommendationsSettings,
    FlowsSettings,
    OrderManagementSettings,
} from 'settings/pages'
import { AccountFeature } from 'state/currentAccount/types'
import { assetsUrl } from 'utils'

import { ConditionalFields } from './ConditionalFields'
import { CustomFields } from './CustomFields'
import { renderAppSettings } from './helpers/settingsRenderer'
import { Macros } from './Macros'
import { Rules } from './Rules'
import { SLA } from './SLA'

export const PaywalledArticleRecommendations = () => (
    <AutomatePaywall>
        <ArticleRecommendationsSettings />
    </AutomatePaywall>
)

export const PaywalledFlows = () => (
    <AutomatePaywall>
        <FlowsSettings />
    </AutomatePaywall>
)

export const PaywalledOrderManagement = () => (
    <AutomatePaywall>
        <OrderManagementSettings />
    </AutomatePaywall>
)

export function WorkflowsRoutes() {
    const { path } = useRouteMatch()

    return (
        <Switch>
            <Route
                path={`${path}/`}
                exact
                component={() => (
                    <Redirect
                        to={`${path}/${routes[WorkflowsRoute.Macros].path}`}
                    />
                )}
            />
            <Route
                path={`${path}/${routes[WorkflowsRoute.CustomerFields].path}`}
            >
                <CustomFields objectType={OBJECT_TYPES.CUSTOMER} />
            </Route>
            <Route path={`${path}/${routes[WorkflowsRoute.TicketFields].path}`}>
                <CustomFields objectType={OBJECT_TYPES.TICKET} />
            </Route>
            <Route
                path={`${path}/${routes[WorkflowsRoute.FieldConditions].path}`}
            >
                <ConditionalFields />
            </Route>
            <Route path={`${path}/${routes[WorkflowsRoute.Macros].path}`}>
                <Macros />
            </Route>
            <Route path={`${path}/${routes[WorkflowsRoute.Rules].path}`}>
                <Rules />
            </Route>
            <Route path={`${path}/${routes[WorkflowsRoute.SLA].path}`}>
                <SLA />
            </Route>
            <Route path={`${path}/${routes[WorkflowsRoute.Tags].path}`} exact>
                {renderAppSettings(ManageTags, {
                    roleParams: [UserRole.Agent, PageSection.ManageTags],
                })}
            </Route>
            <Route
                path={`${path}/${routes[WorkflowsRoute.TicketAssignment].path}`}
                exact
            >
                {renderAppSettings(TicketAssignment)}
            </Route>
            <Route
                path={`${path}/${routes[WorkflowsRoute.AutoMerge].path}`}
                exact
            >
                {renderAppSettings(AutoMergeSettings)}
            </Route>
            <Route
                path={`${path}/${routes[WorkflowsRoute.ArticleRecommendations].path}/:shopType?/:shopName?`}
            >
                {renderAppSettings(PaywalledArticleRecommendations, {
                    roleParams: [UserRole.Agent],
                })}
            </Route>
            <Route
                path={`${path}/${routes[WorkflowsRoute.Flows].path}/:shopType?/:shopName?`}
            >
                {renderAppSettings(PaywalledFlows, {
                    roleParams: [UserRole.Agent],
                })}
            </Route>
            <Route
                path={`${path}/${routes[WorkflowsRoute.OrderManagement].path}/:shopType?/:shopName?`}
            >
                {renderAppSettings(PaywalledOrderManagement, {
                    roleParams: [UserRole.Agent],
                })}
            </Route>
            <Route path={`${path}/${routes[WorkflowsRoute.CSAT].path}`} exact>
                {renderAppSettings(SatisfactionSurveyView, {
                    roleParams: [
                        UserRole.Admin,
                        PageSection.SatisfactionSurveys,
                    ],
                    paywallParams: [
                        AccountFeature.SatisfactionSurveys,
                        undefined,
                        {
                            [AccountFeature.SatisfactionSurveys]: {
                                ...defaultPaywallConfigs[
                                    AccountFeature.SatisfactionSurveys
                                ],
                                preview: assetsUrl(
                                    '/img/paywalls/screens/satisfaction-surveys-settings.png',
                                ),
                            } as PaywallConfig,
                        },
                    ],
                })}
            </Route>
        </Switch>
    )
}
