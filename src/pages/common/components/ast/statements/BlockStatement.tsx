import React from 'react'

import {BlockStatementProps} from '../types'
import BlockStatementItem from './BlockStatementItem'

const BlockStatement = ({
    body,
    rule,
    actions,
    parent,
    schemas,
    depth,
}: BlockStatementProps) => {
    return (
        <div className="BlockStatement">
            {body.map((bodyItem, idx) => (
                <BlockStatementItem
                    key={idx}
                    actions={actions}
                    body={bodyItem}
                    rule={rule}
                    parent={parent.push('body', idx)}
                    schemas={schemas}
                    depth={depth}
                />
            ))}
        </div>
    )
}

export default BlockStatement
