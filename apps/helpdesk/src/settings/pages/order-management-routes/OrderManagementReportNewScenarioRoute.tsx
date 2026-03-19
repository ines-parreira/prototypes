import { createElement } from 'react'

import type { StaticContext } from 'react-router'
import type { RouteComponentProps } from 'react-router-dom'

import { AGENT_ROLE } from 'config/user'
import SelfServiceContactFormsProvider from 'pages/automate/common/providers/SelfServiceContactFormsProvider'
import SelfServiceHelpCentersProvider from 'pages/automate/common/providers/SelfServiceHelpCentersProvider'
import CreateReportOrderIssueFlowScenarioViewContainer from 'pages/automate/orderManagement/legacy/reportOrderIssue/CreateReportOrderIssueFlowScenarioViewContainer'
import withUserRoleRequired from 'pages/common/utils/withUserRoleRequired'

type OrderManagementReportNewScenarioRouteProps = RouteComponentProps<
    {
        shopType: string
    } & {
        shopName: string
    },
    StaticContext,
    unknown
>

export const OrderManagementReportNewScenarioRoute = (
    props: OrderManagementReportNewScenarioRouteProps,
) => (
    <SelfServiceHelpCentersProvider>
        <SelfServiceContactFormsProvider>
            {createElement(
                withUserRoleRequired(
                    CreateReportOrderIssueFlowScenarioViewContainer,
                    AGENT_ROLE,
                ),
                {
                    ...props,
                    shopType: props.match.params.shopType,
                    shopName: props.match.params.shopName,
                },
            )}
        </SelfServiceContactFormsProvider>
    </SelfServiceHelpCentersProvider>
)
