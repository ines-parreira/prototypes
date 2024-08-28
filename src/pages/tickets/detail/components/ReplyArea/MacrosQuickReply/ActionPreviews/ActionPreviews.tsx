import React, {ComponentType} from 'react'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import {getActionTemplate} from 'utils'

import {ActionTemplateExecution} from 'config'
import {MacroDraft} from 'models/macro/types'
import {MacroAction, MacroActionName} from 'models/macroAction/types'
import Preview from 'pages/tickets/common/macros/Preview'

import {ComplexActionPreview} from './ComplexActionPreview'
import TagActionPreview from './TagActionPreview'
import {SimpleActionPreview} from './SimpleActionPreview'

import css from './ActionPreviews.less'

type Props = {
    actions: MacroDraft['actions']
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
    | MacroActionName.ForwardByEmail
    | MacroActionName.ExcludeFromAutoMerge
    | MacroActionName.ExcludeFromCSAT
    | MacroActionName.SetCustomFieldValue

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
    [MacroActionName.ForwardByEmail]: SimpleActionPreview,
    [MacroActionName.ExcludeFromAutoMerge]: SimpleActionPreview,
    [MacroActionName.ExcludeFromCSAT]: SimpleActionPreview,
    [MacroActionName.SetCustomFieldValue]: SimpleActionPreview,
}

export const ActionPreviews = ({actions, textPreviewMinWidth}: Props) => {
    const setResponseTextAction = actions?.find(
        (action) => action.name === MacroActionName.SetResponseText
    )

    const simpleActions = actions?.filter(
        (action) =>
            action.name !== MacroActionName.SetResponseText &&
            getActionTemplate(action.name)?.execution !==
                ActionTemplateExecution.External
    )

    const complexActions = actions?.filter(
        (action) =>
            getActionTemplate(action.name)?.execution ===
            ActionTemplateExecution.External
    )

    const hasSimpleActions = !!simpleActions?.length
    const hasComplexActions = !!complexActions?.length

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
                    {simpleActions?.map((action) => {
                        const ActionPreview =
                            ACTION_COMPONENT_MAPPER[
                                action.name as AvailableActions
                            ]
                        return ActionPreview ? (
                            <ActionPreview key={action.name} action={action} />
                        ) : null
                    })}

                    {hasComplexActions && (
                        <ComplexActionPreview actions={complexActions} />
                    )}
                </div>
            )}
        </>
    )
}
