import type { ReactNode } from 'react'

import type { MacroAction } from '@gorgias/helpdesk-types'

import css from './Preview.less'

export const SetSubjectPreview = ({
    setSubjectAction,
}: {
    setSubjectAction?: MacroAction
}) => {
    if (!setSubjectAction) return null

    return (
        <div className={css.macroData}>
            <strong className="text-muted mr-2">Set subject:</strong>
            <b className={css.integrationAction}>
                {/* TODO(React18): Find a solution to casting to ReactNode once we upgrade to React 18 types */}
                {setSubjectAction.arguments.subject as ReactNode}
            </b>
        </div>
    )
}
