import React from 'react'
import {Map} from 'immutable'

import css from './ViewName.less'

type Props = {
    view: Map<any, any>
}

const ViewName = (props: Props) => {
    const {view, ...wrapperProps} = props
    const name = view.get('name', '')
    const emoji = view.getIn(['decoration', 'emoji'])
    return (
        <span {...wrapperProps}>
            {typeof emoji === 'string' && (
                <span className={css.emoji}>{emoji}</span>
            )}
            {name}
        </span>
    )
}

export default ViewName
