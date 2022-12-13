import React, {Component} from 'react'
import classnames from 'classnames'
import _isArray from 'lodash/isArray'
import _isFunction from 'lodash/isFunction'
import {List, Map} from 'immutable'

import {RuleItemActions} from '../../../settings/rules/types'

import Widget from './Widget'
import Errors from './Errors'
import {validateEmailList} from './actions/Action'

type Props = {
    compact: boolean
    parent: List<any>
    schemas: Map<any, any>
    theKey: Record<string, unknown>
    value: {value?: any}
    config?: {
        validate?: typeof validateEmailList
    }
    actions: RuleItemActions
    rule: Map<any, any>
    leftsiblings: List<any>
}

export default class Property extends Component<Props> {
    static defaultProps: Pick<Props, 'compact'> = {
        compact: false,
    }

    render() {
        const {value, parent, schemas, config = {}} = this.props

        let errors = null

        if (value.value && _isFunction(config.validate)) {
            errors = config.validate(value.value, schemas)
        }

        if (!_isArray(errors)) {
            errors = [errors]
        }

        errors = errors.filter((error) => !!error)

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
                {errors.length ? <Errors belowInput>{errors}</Errors> : null}
            </div>
        )
    }
}
