import React from 'react'

import { List } from 'immutable'
import { drop } from 'lodash'

import Select from './widget/Select'

class Widget extends React.Component {

    _handleChange = (event) => {
        const {actions, index, parent} = this.props
        actions.rules.modifyCodeast(index, parent, event.target.value, 'UPDATE')
    }

    input = (value) => (
        <div className="ui input">
            <input
                value={value}
                onChange={this._handleChange}
                type="text"
            />
        </div>
    )

    textarea = (value) => (
        <textarea
            value={value}
            onChange={this._handleChange}
            type="text"
        />
    )

    render() {
        const { value, leftsiblings, schemas, parent } = this.props

        if (!(schemas && schemas.size && leftsiblings && leftsiblings.size)) return null

        let left = leftsiblings
        // we need to figure out if the path contains '$ref' objects, then resolve them from that
        const path = []
        for (const item of leftsiblings.toJS()) {
            path.push(item)
            const schema = schemas.getIn(path)

            if (schema && schema.has('$ref')) {
                // get the remaining path
                const obj = schema.get('$ref').split('/')[2]
                const newLeft = List(['definitions', obj, 'properties'])
                const newRight = List(drop(leftsiblings.toJS(), path.length))
                left = newLeft.concat(newRight)
            }
        }

        // widget data used for rendering
        const widget = {
            type: 'select',
            value,
            description: '',
            options: [],
        }

        // todo(@xarg): should be defined in the schema what values are allowed
        const allowedObjects = ['ticket', 'event']

        if (left.size === 1 && left.get(0) === 'definitions') {
            // we are at the root here, only allow some values
            widget.options = allowedObjects
        } else if (left.last() === 'properties') {
            // are special because they are defining the props
            // that available on the top level objects: ticket, event, etc..
            const props = schemas.getIn(left).toJS()
            for (const key of Object.keys(props)) {
                const prop = props[key]

                // only show props that have a meta value
                if (!prop.hasOwnProperty('meta')) continue

                widget.options.push(key)
                widget.description = prop.description
            }
        } else if (left.last() === 'operators') {
            // operators are using simple select widget, all we need is the options
            const operators = schemas.getIn(left)
            if (operators) widget.options = operators.toJS()
        } else {
            // all other properties
            const right = schemas.getIn(left)
            if (!right) return this.input(value)

            widget.type = right.getIn(['meta', 'rules', 'widget'])
            if (!widget.type) return this.input(value)

            widget.description = right.get('description')

            widget.options = right.getIn(['meta', 'enum'])
            if (widget.options) widget.options = widget.options.toJS()
            else return this.input(value)
        }

        switch (widget.type) {
            case 'select':
                return (
                    <Select
                        {...widget}
                        style={{ backgroundColor: 'white' }}
                        isCallee={parent.contains('callee')}
                        handleChange={this._handleChange}
                    />
                )
            case 'input':
                return this.input(value)
            case 'textarea':
                return this.textarea(value)
            default:
                throw Error(`Unknown widget type: ${widget.type}`)
        }
    }
}

Widget.propTypes = {
    value: React.PropTypes.any,
    index: React.PropTypes.number,
    parent: React.PropTypes.object,
    schemas: React.PropTypes.object,
    actions: React.PropTypes.object,
    leftsiblings: React.PropTypes.object,
}

export default Widget
