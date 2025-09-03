import cn from 'classnames'

import { MacroAction } from '@gorgias/helpdesk-types'

import css from './Preview.less'

export const ForwardByEmailPreview = ({
    action,
    isMacroForwardByEmailEnabled,
}: {
    action?: MacroAction
    isMacroForwardByEmailEnabled: boolean
}) => {
    if (!action || !isMacroForwardByEmailEnabled) return null

    return (
        <div className={css.macroData}>
            <strong className="text-muted mr-2 align-middle">
                {action.title}:
            </strong>
            <span className={cn('material-icons mr-2', css.icon)}>forward</span>
            <span className={css.internalNote}>
                {action.arguments.to as string}
            </span>
        </div>
    )
}
