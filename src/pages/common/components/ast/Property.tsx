import React from 'react'
import classnames from 'classnames'
import _isFunction from 'lodash/isFunction'
import {List, Map} from 'immutable'

import {RuleItemActions} from '../../../settings/rules/detail/components/RuleItem/RuleItem'

import Widget from './Widget'
import Errors from './Errors.js'

type Props = {
    compact: boolean
    parent: List<any>
    schemas: Map<any, any>
    theKey: Record<string, unknown>
    value: {value?: any}
    config?: {
        validate?: (value: any, schemas: Map<any, any>) => boolean
    }
    actions: RuleItemActions
    rule: Map<any, any>
    leftsiblings: List<any>
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
