import React from 'react'

import { StaticContext } from 'react-router'
import { RouteComponentProps } from 'react-router-dom'

import { AGENT_ROLE } from 'config/user'
import SelfServiceContactFormsProvider from 'pages/automate/common/providers/SelfServiceContactFormsProvider'
import SelfServiceHelpCentersProvider from 'pages/automate/common/providers/SelfServiceHelpCentersProvider'
import WorkflowEditorViewContainer from 'pages/automate/workflows/editor/WorkflowEditorViewContainer'
import withUserRoleRequired from 'pages/common/utils/withUserRoleRequired'

type AutomateSettingsFlowsEditRouteProps = RouteComponentProps<
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

export const AutomateSettingsFlowsEditRoute = (
    props: AutomateSettingsFlowsEditRouteProps,
) => (
    <SelfServiceHelpCentersProvider>
        <SelfServiceContactFormsProvider>
            {React.createElement(
                withUserRoleRequired(WorkflowEditorViewContainer, AGENT_ROLE),
                {
                    ...props,
                    editWorkflowId: props.match.params.editWorkflowId,
                    shopType: props.match.params.shopType,
                    shopName: props.match.params.shopName,
                },
            )}
        </SelfServiceContactFormsProvider>
    </SelfServiceHelpCentersProvider>
)
