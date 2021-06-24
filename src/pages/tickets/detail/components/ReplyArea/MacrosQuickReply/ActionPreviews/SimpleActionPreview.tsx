import React from 'react'
import {Badge} from 'reactstrap'

import {
    MacroAction,
    MacroActionName,
} from '../../../../../../../models/macroAction/types'
import * as Label from '../../../../../../common/utils/labels.js'
import {fileIconFromContentType} from '../../../../../common/utils.js'
import {getActionTemplate} from '../../../../../../../utils'

import {BaseActionPreview} from './BaseActionPreview'

import css from './SimpleActionPreview.less'

type Props = {
    action: MacroAction
}

export const SimpleActionPreview = ({action}: Props) => {
    const getLabel = (action: MacroAction) => {
        const args = action.arguments
        switch (action.name) {
            case MacroActionName.SetStatus:
                return (
                    <Label.StatusLabel
                        status={args.status!}
                        className={css.smallTag}
                    />
                )
            case MacroActionName.SnoozeTicket:
                return (
                    <Label.TimedeltaLabel
                        duration={args.snooze_timedelta!}
                        className={css.smallTag}
                    />
                )
            case MacroActionName.SetSubject:
                return <div className={css.setSubject}>{args.subject}</div>
            case MacroActionName.SetAssignee:
                return (
                    <Label.AgentLabel
                        className={css.assign}
                        name={args.assignee_user?.name ?? 'Unassigned'}
                    />
                )
            case MacroActionName.SetTeamAssignee:
                return (
                    <Label.TeamLabel
                        className={css.assign}
                        name={args.assignee_team?.name ?? 'Unassigned'}
                    />
                )
            case MacroActionName.AddAttachments:
                return args.attachments!.map((file) => (
                    <Badge className={css.attachments} key={file.name}>
                        <span className="material-icons mr-2">
                            {fileIconFromContentType(file.content_type!)}
                        </span>
                        <span>{file.name}</span>
                    </Badge>
                ))
            default:
                break
        }
    }

    return (
        <BaseActionPreview
            actionName={getActionTemplate(action.name)?.title as string}
            columns
        >
            {getLabel(action)}
        </BaseActionPreview>
    )
}
