import React from 'react'
import _isFunction from 'lodash/isFunction'
import Widget from './Widget'
import ErrorMessage from '../../../common/components/ErrorMessage'
/*
 interface Property <: Node {
 type: "Property";
 key: Literal | Identifier;
 value: Expression;
 kind: "init" | "get" | "set";
 }
 */
const Property = ({value, actions, leftsiblings, parent, rule, schemas, config = {}}) => {
    let errors = null

    if (value.value && _isFunction(config.validate)) {
        errors = config.validate(value.value, schemas)
    }
    return (
        <div className="field">
            <Widget
                value={value.value}
                type={config.widget}
                parent={parent.push('value', 'value')}
                leftsiblings={leftsiblings}
                actions={actions}
                rule={rule}
                schemas={schemas}
                config={config}
            />
            <ErrorMessage errors={errors}/>
        </div>
    )
}

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
