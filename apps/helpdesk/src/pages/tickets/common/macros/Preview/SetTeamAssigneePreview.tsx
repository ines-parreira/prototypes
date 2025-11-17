import type { MacroAction } from '@gorgias/helpdesk-types'

import { TeamLabel } from 'pages/common/utils/labels'

import css from './Preview.less'

export const SetTeamAssigneePreview = ({
    setTeamAssigneeAction,
}: {
    setTeamAssigneeAction?: MacroAction
}) => {
    if (!setTeamAssigneeAction) return null

    return (
        <div className={css.macroData}>
            <strong className="text-muted mr-2 align-middle">
                Assign to team:
            </strong>
            <span>
                <TeamLabel
                    className="align-middle"
                    name={
                        (
                            setTeamAssigneeAction.arguments as {
                                assignee_team: { name: string }
                            }
                        ).assignee_team?.name
                    }
                />
            </span>
        </div>
    )
}
