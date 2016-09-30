import React from 'react'

import Widget from './Widget'

/*
 interface Property <: Node {
 type: "Property";
 key: Literal | Identifier;
 value: Expression;
 kind: "init" | "get" | "set";
}
 */
const Property = ({ theKey, value, actions, leftsiblings, parent, index, schemas }) => (
    <div className="field">
        <div className="ui labeled input">
            <div className="ui label">{theKey.name}</div>
            <Widget
               value={value.value}
               parent={parent.push('value', 'value')}
               leftsiblings={leftsiblings}
               actions={actions}
               index={index}
               schemas={schemas}
            />
        </div>
    </div>
)

Property.propTypes = {
    actions: React.PropTypes.object.isRequired,
    index: React.PropTypes.number.isRequired,
    leftsiblings: React.PropTypes.object.isRequired,
    parent: React.PropTypes.object.isRequired,
    schemas: React.PropTypes.object.isRequired,
    theKey: React.PropTypes.object.isRequired,
    value: React.PropTypes.object.isRequired,
}

export default Property
