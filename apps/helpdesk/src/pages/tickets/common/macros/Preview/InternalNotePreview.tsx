import cn from 'classnames'

import { MacroAction } from '@gorgias/helpdesk-types'

import css from './Preview.less'

export const InternalNotePreview = ({ action }: { action?: MacroAction }) => {
    if (!action) return null
    return (
        <div className={css.macroData}>
            <strong className="text-muted mr-2 align-middle">
                Send internal note:
            </strong>
            <span
                className={cn(
                    'material-icons mr-2',
                    css.icon,
                    css.internalNoteIcon,
                )}
            >
                note
            </span>
            <span className={css.internalNote}>{action.title}</span>
        </div>
    )
}
