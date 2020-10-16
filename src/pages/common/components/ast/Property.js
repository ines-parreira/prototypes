// @flow
import React from 'react'
import classnames from 'classnames'
import _isFunction from 'lodash/isFunction'

import type {List} from 'immutable'

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
type Props = {
    compact: boolean,
    parent: List<*>,
    schemas: Object,
    theKey: Object,
    value: Object,
    config?: Object,
    actions: Object,
    rule: Object,
    leftsiblings: List<any>,
}

export default class Property extends React.Component<Props> {
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
                    config={config}
                    parent={parent.push('value', 'value')}
                />
                {errors ? <Errors belowInput>{errors}</Errors> : null}
            </div>
        )
    }
}
