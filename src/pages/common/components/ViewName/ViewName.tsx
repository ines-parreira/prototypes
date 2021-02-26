import React from 'react'
import {Map} from 'immutable'

type Props = {
    view: Map<any, any>
}

const ViewName = (props: Props) => {
    const {view, ...wrapperProps} = props
    const name = view.get('name', '')
    const emoji = view.getIn(['decoration', 'emoji'])
    return (
        <span {...wrapperProps}>
            {typeof emoji === 'string' && emoji + ' '}
            {name}
        </span>
    )
}

export default ViewName
