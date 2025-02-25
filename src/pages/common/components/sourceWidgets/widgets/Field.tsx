import React from 'react'

import { getValueFromData } from 'Widgets/modules/Template/helpers/fieldDataMappers'

import css from './Field.less'

export default function Field({
    path,
    value,
}: {
    path: string
    value: unknown
}) {
    return (
        <div className={`draggable ${css.sourceWidgetField}`} data-key={path}>
            <span className={css.sourceWidgetFieldLabel}>{path}:</span>
            <span className={css.sourceWidgetFieldValue}>
                {getValueFromData(value)}
            </span>
        </div>
    )
}
