import React from 'react'

import {displayValue} from 'pages/common/components/infobar/utils'
import css from './Field.less'

export default function Field({path, value}: {path: string; value: unknown}) {
    return (
        <div className={`draggable ${css.sourceWidgetField}`} data-key={path}>
            <span className={css.sourceWidgetFieldLabel}>{path}:</span>
            <span className={css.sourceWidgetFieldValue}>
                {displayValue(value)}
            </span>
        </div>
    )
}
