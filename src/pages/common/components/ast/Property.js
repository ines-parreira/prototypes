import React from 'react'
import classnames from 'classnames'
import _isFunction from 'lodash/isFunction'

import Widget from './Widget'
import Errors from './Errors'

/*
 interface Property <: Node {
 type: "Property";
 key: Literal | Identifier;
 value: Expression;
 kind: "init" | "get" | "set";
 }
 */
export default class Property extends React.Component {
    static propTypes = {
        compact: React.PropTypes.bool.isRequired,
        parent: React.PropTypes.object.isRequired,
        schemas: React.PropTypes.object.isRequired,
        theKey: React.PropTypes.object.isRequired,
        value: React.PropTypes.object.isRequired,
        config: React.PropTypes.object,
    }

    static defaultProps = {
        compact: false,
    }

    render() {
        const {value, parent, schemas, config = {}} = this.props

        let errors = null

        if (value.value && _isFunction(config.validate)) {
            errors = config.validate(value.value, schemas)
        }

        return (
            <div
                className={classnames({
                    'd-flex': this.props.compact, // flex this wrapper if inline so we don't have spacing issues
                })}
            >
                <Widget
                    {...this.props}
                    value={value.value}
                    type={config.widget}
                    parent={parent.push('value', 'value')}
                />
                <Errors belowInput>{errors}</Errors>
            </div>
        )
    }
}
