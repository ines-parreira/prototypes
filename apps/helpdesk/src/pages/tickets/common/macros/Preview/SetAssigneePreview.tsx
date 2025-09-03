import { MacroAction } from '@gorgias/helpdesk-types'

import { AgentLabel } from 'pages/common/utils/labels'

import css from './Preview.less'

export const SetAssigneePreview = ({
    setAssigneeAction,
}: {
    setAssigneeAction?: MacroAction
}) => {
    if (!setAssigneeAction) return null

    return (
        <div className={css.macroData}>
            <strong className="text-muted mr-2 align-middle">
                Assign to user:
            </strong>
            <span>
                <AgentLabel
                    className="align-middle"
                    name={
                        (
                            setAssigneeAction.arguments as {
                                assignee_user: { name: string } | null
                            }
                        ).assignee_user?.name
                    }
                />
            </span>
        </div>
    )
}
