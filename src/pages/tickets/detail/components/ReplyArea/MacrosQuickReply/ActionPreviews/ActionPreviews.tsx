import React, {ComponentType} from 'react'

import {fromJS} from 'immutable'

import classnames from 'classnames'

import {getActionTemplate} from 'utils'

import {MacroAction, MacroActionName} from 'models/macroAction/types'
import Preview from 'pages/tickets/common/macros/Preview'

import {ActionTemplateExecution} from 'config'
import TagActionPreview from './TagActionPreview'
import {SimpleActionPreview} from './SimpleActionPreview'
import {ComplexActionPreview} from './ComplexActionPreview'

import css from './ActionPreviews.less'

type Props = {
    actions: MacroAction[]
    textPreviewMinWidth: number
}

type AvailableActions =
    | MacroActionName.SetStatus
    | MacroActionName.SnoozeTicket
    | MacroActionName.AddTags
    | MacroActionName.SetAssignee
    | MacroActionName.SetTeamAssignee
    | MacroActionName.SetSubject
    | MacroActionName.AddAttachments
    | MacroActionName.AddInternalNote

const ACTION_COMPONENT_MAPPER: Record<
    AvailableActions,
    ComponentType<{action: MacroAction}>
> = {
    [MacroActionName.SetStatus]: SimpleActionPreview,
    [MacroActionName.SnoozeTicket]: SimpleActionPreview,
    [MacroActionName.AddTags]: TagActionPreview,
    [MacroActionName.SetAssignee]: SimpleActionPreview,
    [MacroActionName.SetTeamAssignee]: SimpleActionPreview,
    [MacroActionName.SetSubject]: SimpleActionPreview,
    [MacroActionName.AddAttachments]: SimpleActionPreview,
    [MacroActionName.AddInternalNote]: SimpleActionPreview,
}

export const ActionPreviews = ({actions, textPreviewMinWidth}: Props) => {
    const setResponseTextAction = actions.find(
        (action) => action.name === MacroActionName.SetResponseText
    )

    const simpleActions = actions.filter(
        (action) =>
            action.name !== MacroActionName.SetResponseText &&
            getActionTemplate(action.name)?.execution !==
                ActionTemplateExecution.External
    )

    const complexActions = actions.filter(
        (action) =>
            getActionTemplate(action.name)?.execution ===
            ActionTemplateExecution.External
    )

    const hasSimpleActions = simpleActions.length > 0
    const hasComplexActions = complexActions.length > 0

    return (
        <>
            {setResponseTextAction && (
                <div
                    className={css.popoverText}
                    style={{minWidth: textPreviewMinWidth}}
                >
                    <Preview actions={fromJS([setResponseTextAction])} />
                </div>
            )}
            {(hasSimpleActions || hasComplexActions) && (
                <div
                    className={classnames(css.popoverActionWrapper, {
                        [css.leftBorder]: setResponseTextAction,
                    })}
                >
                    {simpleActions.map((action) => {
                        const ActionPreview =
                            ACTION_COMPONENT_MAPPER[
                                action.name as AvailableActions
                            ]
                        return (
                            <ActionPreview key={action.name} action={action} />
                        )
                    })}

                    {hasComplexActions && (
                        <ComplexActionPreview actions={complexActions} />
                    )}
                </div>
            )}
        </>
    )
}
