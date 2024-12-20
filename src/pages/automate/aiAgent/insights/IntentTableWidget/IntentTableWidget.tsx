import React from 'react'

import {IntentTableWithDefaultState} from './IntentTable'
import css from './IntentTableWidget.less'

type IntentWidget = {
    title: string
    description: string
    tableTitle: string
    tableHint?: string
}

export const IntentTableWidget = ({
    title,
    description,
    tableTitle,
    tableHint,
}: IntentWidget) => {
    return (
        <div>
            <div className={css.title}>{title}</div>
            <div className={css.description}>{description}</div>
            <IntentTableWithDefaultState
                tableTitle={tableTitle}
                tableHint={tableHint}
            />
        </div>
    )
}
