import { createElement } from 'react'

import type { StaticContext } from 'react-router'
import type { RouteComponentProps } from 'react-router-dom'

import { AGENT_ROLE } from 'config/user'
import SelfServiceContactFormsProvider from 'pages/automate/common/providers/SelfServiceContactFormsProvider'
import SelfServiceHelpCentersProvider from 'pages/automate/common/providers/SelfServiceHelpCentersProvider'
import WorkflowAnalyticsContainer from 'pages/automate/workflows/analytics/WorkflowAnalyticsContainer'
import withUserRoleRequired from 'pages/common/utils/withUserRoleRequired'

type AutomateSettingsFlowsAnalyticsRouteProps = RouteComponentProps<
    {
        shopType: string
    } & {
        shopName: string
    } & {
        editWorkflowId: string
    },
    StaticContext,
    unknown
>

export const AutomateSettingsFlowsAnalyticsRoute = (
    props: AutomateSettingsFlowsAnalyticsRouteProps,
) => (
    <SelfServiceHelpCentersProvider>
        <SelfServiceContactFormsProvider>
            {createElement<{
                shopType: string
                shopName: string
                editWorkflowId: string
            }>(withUserRoleRequired(WorkflowAnalyticsContainer, AGENT_ROLE), {
                ...props,
                editWorkflowId: props.match.params.editWorkflowId,
                shopType: props.match.params.shopType,
                shopName: props.match.params.shopName,
            })}
        </SelfServiceContactFormsProvider>
    </SelfServiceHelpCentersProvider>
)
