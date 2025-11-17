import type { MacroAction } from '@gorgias/helpdesk-types'

import { StatusLabel } from 'pages/common/utils/labels'

import css from './Preview.less'

export const SetStatusPreview = ({
    setStatusAction,
}: {
    setStatusAction?: MacroAction
}) => {
    if (!setStatusAction) return null

    return (
        <div className={css.macroData}>
            <strong className="text-muted mr-2">Set status:</strong>
            <StatusLabel status={setStatusAction.arguments.status as string} />
        </div>
    )
}
