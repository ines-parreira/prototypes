import { createElement } from 'react'

import type { StaticContext } from 'react-router'
import type { RouteComponentProps } from 'react-router-dom'

import { AGENT_ROLE } from 'config/user'
import SelfServiceContactFormsProvider from 'pages/automate/common/providers/SelfServiceContactFormsProvider'
import SelfServiceHelpCentersProvider from 'pages/automate/common/providers/SelfServiceHelpCentersProvider'
import EditReportOrderIssueFlowScenarioViewContainer from 'pages/automate/orderManagement/legacy/reportOrderIssue/EditReportOrderIssueFlowScenarioViewContainer'
import withUserRoleRequired from 'pages/common/utils/withUserRoleRequired'

type OrderManagementReportEditRouteProps = RouteComponentProps<
    {
        shopType: string
    } & {
        shopName: string
    } & {
        scenarioIndex: string
    },
    StaticContext,
    unknown
>

export const OrderManagementReportEditRoute = (
    props: OrderManagementReportEditRouteProps,
) => (
    <SelfServiceHelpCentersProvider>
        <SelfServiceContactFormsProvider>
            {createElement(
                withUserRoleRequired(
                    EditReportOrderIssueFlowScenarioViewContainer,
                    AGENT_ROLE,
                ),
                {
                    ...props,
                    shopType: props.match.params.shopType,
                    shopName: props.match.params.shopName,
                    scenarioIndex: props.match.params.scenarioIndex,
                },
            )}
        </SelfServiceContactFormsProvider>
    </SelfServiceHelpCentersProvider>
)
