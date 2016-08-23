import React, {PropTypes} from 'react'
import Widget from './Widget'

/*
 interface Property <: Node {
 type: "Property";
 key: Literal | Identifier;
 value: Expression;
 kind: "init" | "get" | "set";
}
 */
export default class Property extends React.Component {
    render() {
        const {theKey, value, actions, leftsiblings, parent, index, schemas} = this.props
        return (
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
        )
    }
}

Property.propTypes = {
    value: PropTypes.object
}
