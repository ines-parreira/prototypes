import React from 'react'

import { StaticContext } from 'react-router'
import { RouteComponentProps } from 'react-router-dom'

import { AGENT_ROLE } from 'config/user'
import WorkflowsViewContainer from 'pages/automate/workflows/WorkflowsViewContainer'
import withUserRoleRequired from 'pages/common/utils/withUserRoleRequired'

type AutomateSettingsFlowsBaseRouteProps = RouteComponentProps<
    {
        shopType: string
    } & {
        shopName: string
    },
    StaticContext,
    unknown
>

export const AutomateSettingsFlowsBaseRoute = (
    props: AutomateSettingsFlowsBaseRouteProps,
) =>
    React.createElement(
        withUserRoleRequired(WorkflowsViewContainer, AGENT_ROLE),
        {
            ...props,
            shopType: props.match.params.shopType,
            shopName: props.match.params.shopName,
        },
    )
