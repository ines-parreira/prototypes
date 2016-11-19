import React from 'react'

import Widget from './Widget'

/*
 interface Identifier <: Node, Expression, Pattern {
 type: "Identifier";
 name: string;
}
 */
const Identifier = ({ name, parent, rule, actions, schemas, leftsiblings }) => {
    const parentNew = parent.push('name')

    switch (name) {
        case 'Action':
            return <button className="ui orange button inline">TAKE ACTION</button>
        case 'list_of_actions':
            return <span />
        default:
            return (
                <span className="Identifier">
                    <Widget
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
}

Identifier.propTypes = {
    rule: React.PropTypes.object.isRequired,
    actions: React.PropTypes.object.isRequired,
    leftsiblings: React.PropTypes.object.isRequired,
    name: React.PropTypes.string.isRequired,
    parent: React.PropTypes.object.isRequired,
    schemas: React.PropTypes.object.isRequired,
}

export default Identifier
