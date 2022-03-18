import React, {ComponentType} from 'react'

import {fromJS} from 'immutable'

import classnames from 'classnames'

import {
    MacroAction,
    MacroActionName,
} from '../../../../../../../models/macroAction/types'
import {getActionTemplate} from '../../../../../../../utils'
import Preview from '../../../../../common/macros/Preview'

import TagActionPreview from './TagActionPreview'
import {SimpleActionPreview} from './SimpleActionPreview'
import {BackendActionPreview} from './BackendActionPreview'

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
}

export const ActionPreviews = ({actions, textPreviewMinWidth}: Props) => {
    const setResponseTextAction = actions.find(
        (action) => action.name === MacroActionName.SetResponseText
    )

    const backActions = actions.filter(
        (action) => getActionTemplate(action.name)?.execution === 'back'
    )

    const otherActions = actions.filter(
        (action) =>
            action.name !== MacroActionName.SetResponseText &&
            getActionTemplate(action.name)?.execution !== 'back'
    )

    const hasOtherActions = otherActions.length > 0
    const hasBackActions = backActions.length > 0

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
            {(hasOtherActions || hasBackActions) && (
                <div
                    className={classnames(css.popoverActionWrapper, {
                        [css.leftBorder]: setResponseTextAction,
                    })}
                >
                    {hasOtherActions &&
                        Object.keys(ACTION_COMPONENT_MAPPER).map(
                            (actionType: string) => {
                                const Component =
                                    ACTION_COMPONENT_MAPPER[
                                        actionType as AvailableActions
                                    ]
                                const action = otherActions.find(
                                    (action) => action.name === actionType
                                )
                                return (
                                    action && (
                                        <Component
                                            action={action}
                                            key={actionType}
                                        />
                                    )
                                )
                            }
                        )}

                    {hasBackActions && (
                        <BackendActionPreview actions={backActions} />
                    )}
                </div>
            )}
        </>
    )
}
