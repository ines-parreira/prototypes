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
const Property = ({theKey, value, actions, leftsiblings, parent, index, schemas, config}) => (
    <div className="field">
        <div className="ui labeled input">
            <div className="ui label">{(config && config.name) || theKey.name}</div>
            <Widget
                value={value.value}
                type={config ? config.widget : null}
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
    config: React.PropTypes.object,
}

export default Property
