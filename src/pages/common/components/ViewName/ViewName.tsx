import React from 'react'

import css from './ViewName.less'

type Props = {
    viewName: string
    emoji?: string
}

const ViewName = ({viewName = '', emoji}: Props) => {
    return (
        <span>
            {typeof emoji === 'string' && (
                <span className={css.emoji}>{emoji}</span>
            )}
            {viewName}
        </span>
    )
}

export default React.memo(ViewName)
