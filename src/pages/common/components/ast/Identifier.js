import React from 'react'
import type {Map, List} from 'immutable'

import Widget from './Widget'

/*
 interface Identifier <: Node, Expression, Pattern {
 type: "Identifier";
 name: string;
 }
 */

type Props = {
    rule: Map<*, *>,
    actions: Object,
    leftsiblings: Object,
    name: string,
    parent: List<*>,
    schemas: Object,
    className?: string,
}

const Identifier = ({
    name,
    parent,
    rule,
    actions,
    schemas,
    leftsiblings,
    className,
}: Props) => {
    const parentNew = parent.push('name')

    return (
        <span className="Identifier">
            <Widget
                className={className}
                value={name}
                parent={parentNew}
                rule={rule}
                actions={actions}
                leftsiblings={leftsiblings}
                schemas={schemas}
            />
        </span>
    )
}

export default Identifier
