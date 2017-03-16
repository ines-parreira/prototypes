import React from 'react'

import {List} from 'immutable'
import drop from 'lodash/drop'

import Select from './widget/ReactSelect'
import StatusSelect from './widget/StatusSelect'
import PrioritySelect from './widget/PrioritySelect'
import MacroSelect from './widget/MacroSelect'
import AssigneeSelect from './widget/AssigneeSelect'

class Widget extends React.Component {

    _handleChange = (value) => {
        const {actions, rule, parent} = this.props
        actions.rules.modifyCodeast(rule.get('id'), parent, value, 'UPDATE')
    }

    _handleChangeByEvent = (event) => {
        const {actions, rule, parent} = this.props
        actions.rules.modifyCodeast(rule.get('id'), parent, event.target.value, 'UPDATE')
    }

    _input = (value) => (
        <span className="ui input" style={{verticalAlign: 'middle'}}>
            <input
                type="text"
                value={value}
                onChange={this._handleChangeByEvent}
                placeholder={this.props.config.placeholder || ''}
                required={this.props.config.required || false}
            />
        </span>
    )

    _textarea = (value) => (
        <textarea
            type="text"
            value={value}
            onChange={this._handleChangeByEvent}
            placeholder={this.props.config.placeholder || ''}
            required={this.props.config.required || false}
        />
    )

    _resolveLeft(left, schemas) {
        // we need to figure out if the path contains '$ref' objects, then resolve them and update the path
        const path = []
        for (const item of left.toJS()) {
            path.push(item)
            const schema = schemas.getIn(path)

            if (schema) {
                let ref = ''
                if (schema.get('type') === 'array') {
                    ref = schema.getIn(['items', '$ref'])
                } else if (schema.has('$ref')) {
                    ref = schema.get('$ref')
                }

                if (ref) {
                    const def = ref.split('/')[2]
                    // get the remaining path
                    const newLeft = List(['definitions', def, 'properties'])
                    const newRight = List(drop(left.toJS(), path.length))
                    return this._resolveLeft(newLeft.concat(newRight), schemas)
                }
            }
        }
        return left
    }

    render() {
        const {leftsiblings, schemas, value} = this.props

        if (!(schemas && schemas.size && leftsiblings && leftsiblings.size)) {
            return null
        }

        const left = this._resolveLeft(leftsiblings, schemas)

        // widget data used for rendering
        const widget = {
            type: 'select',
            value,
            description: '',
            options: [],
        }

        // todo(@xarg): should be defined in the schema what values are allowed
        const rootObjects = ['ticket', 'message', 'event']

        if (left.size === 1 && left.get(0) === 'definitions') {
            // we are at the root here, only allow some values
            widget.options = rootObjects
        } else if (left.last() === 'properties') {
            // are special because they are defining the props
            // that available on the top level objects: ticket, event, etc..
            const props = schemas.getIn(left).toJS()
            for (const key of Object.keys(props)) {
                const prop = props[key]

                // only show props that have a meta value or a refs
                if (prop.hasOwnProperty('meta')) {
                    widget.options.push(key)
                    widget.description = prop.description
                } else if (prop.hasOwnProperty('$ref')) {
                    widget.options.push(key)
                    widget.description = ''
                }
            }
        } else if (left.last() === 'operators') {
            // operators are using simple select widget, all we need is the options
            const operators = schemas.getIn(left)
            if (operators) {
                widget.options = operators.toJS()
            }
        } else if (left.first() === 'actions') {
            widget.type = `${left.last()}-select`
        } else {
            // all other properties
            const right = schemas.getIn(left)
            if (!right) {
                return this._input(value)
            }

            widget.type = right.getIn(['meta', 'rules', 'widget']) || 'input'

            const options = right.getIn(['meta', 'enum'])
            widget.options = options ? options.toJS() : []

            widget.description = right.get('description')
        }

        const widgetType = this.props.type || widget.type

        switch (widgetType) {
            case 'select':
                return <Select {...widget} onChange={this._handleChange}/>
            case 'status-select':
                return <StatusSelect {...widget} onChange={this._handleChange}/>
            case 'priority-select':
                return <PrioritySelect {...widget} onChange={this._handleChange}/>
            case 'macro-select':
                return <MacroSelect {...widget} onChange={this._handleChange} />
            case 'assignee_user-select':
                return <AssigneeSelect {...widget} onChange={this._handleChange} />
            case 'textarea':
                return this._textarea(value)
            case 'input':
            default:
                return this._input(value)
        }
    }
}

Widget.defaultProps = {
    config: {}
}

Widget.propTypes = {
    rule: React.PropTypes.object,
    value: React.PropTypes.any,
    parent: React.PropTypes.object,
    schemas: React.PropTypes.object,
    actions: React.PropTypes.object,
    type: React.PropTypes.string,
    leftsiblings: React.PropTypes.object,

    config: React.PropTypes.object,
}

export default Widget
