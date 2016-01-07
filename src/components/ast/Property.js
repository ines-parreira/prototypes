import React, {PropTypes} from 'react'
import Input from './Input'
import Immutable from 'immutable'

import {DEFAULT_OPTION_CHAINS} from './Dropdown'

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
        const { theKey, value, actions, leftsiblings, parent, index, schemas } = this.props

        console.log(schemas)
        const options = Immutable.fromJS(DEFAULT_OPTION_CHAINS)
        const widgetType = options.getIn(leftsiblings.push('widget').toJS())

        return (
            <div className="ui labeled input">
                <div className="ui label">
                    { theKey.name }
                </div>
                <Input widgetType={ widgetType } value={ value.value } parent={ parent.push('value', 'value') }
                       actions={actions} index={ index}/>
            </div>
        )
    }
}

Property.propTypes = {
    value: PropTypes.object
}
