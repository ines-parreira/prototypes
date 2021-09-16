import React from 'react'
import {Map, List} from 'immutable'

import {RuleItemActions} from '../../../settings/rules/RulesSettingsForm'

import Widget from './Widget'

type Props = {
    rule: Map<any, any>
    actions: RuleItemActions
    leftsiblings?: List<any>
    name: string
    parent: List<any>
    schemas: Map<any, any>
    className?: string
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
