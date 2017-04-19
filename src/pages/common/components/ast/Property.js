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
const Property = ({value, actions, leftsiblings, parent, rule, schemas, config}) => (
    <Widget
        value={value.value}
        type={config ? config.widget : null}
        parent={parent.push('value', 'value')}
        leftsiblings={leftsiblings}
        actions={actions}
        rule={rule}
        schemas={schemas}
        config={config}
    />
)

Property.propTypes = {
    rule: React.PropTypes.object.isRequired,
    actions: React.PropTypes.object.isRequired,
    leftsiblings: React.PropTypes.object.isRequired,
    parent: React.PropTypes.object.isRequired,
    schemas: React.PropTypes.object.isRequired,
    theKey: React.PropTypes.object.isRequired,
    value: React.PropTypes.object.isRequired,
    config: React.PropTypes.object,
}

export default Property
