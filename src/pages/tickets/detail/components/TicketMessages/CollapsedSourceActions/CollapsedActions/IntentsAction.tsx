import React from 'react'

import CollapsedAction from './CollapsedAction'

type Props = {
    onClick: () => void
}

const IntentsAction: React.FC<Props> = ({onClick}) => (
    <CollapsedAction
        icon={<i className="material-icons">auto_awesome</i>}
        title={'All intents'}
        description={'See detected intents'}
        nested
        onClick={onClick}
        toggle={false}
    />
)

export default IntentsAction
