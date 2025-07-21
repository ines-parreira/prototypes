import { IntentTableWithDefaultState } from './IntentTable'

import css from './IntentTableWidget.less'

type IntentWidget = {
    title?: string
    description?: string
    tableTitle: string
    tableDescription?: string
    tableHint?: {
        title: string
        link: string
        linkText: string
    }
    intentLevel: number
}

export const IntentTableWidget = ({
    title,
    description,
    tableTitle,
    tableDescription,
    tableHint,
    intentLevel,
}: IntentWidget) => {
    return (
        <div>
            <div className={css.title}>{title}</div>
            <div className={css.description}>{description}</div>
            <IntentTableWithDefaultState
                tableTitle={tableTitle}
                tableDescription={tableDescription}
                tableHint={tableHint}
                intentLevel={intentLevel}
            />
        </div>
    )
}
