import React, { PropTypes } from 'react'
import Select from './widget/Select'
import { List } from 'immutable'
import { drop } from 'lodash'

export default class Widget extends React.Component {
    handleChange(event) {
        const {actions, index, parent} = this.props

        actions.modifyCodeast(index, parent, event.target.value, 'UPDATE')
        // console.log(actions.modifyCodeast)
    }

    input(value) {
        return (
            <input
                value={value}
                onChange={this.handleChange.bind(this)}
                type="text"
            />
        )
    }

    textarea(value) {
        return (
            <textarea
                value={value}
                onChange={this.handleChange.bind(this)}
                type="text"
            />
        )
    }

    render() {
        const {value, leftsiblings, schemas} = this.props

        if (!(schemas && schemas.size && leftsiblings && leftsiblings.size)) {
            return null
        }

        let left = leftsiblings
        // we need to figure out if the path contains '$ref' objects, then resolve them from that
        let path = []
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
        let widget = {
            type: 'select',
            value: value,
            description: '',
            options: []
        }

        const allowedObjects = ['ticket', 'event'] // todo(@xarg): should be defined in the schema what values are allowed
        if (left.size === 1 && left.get(0) === 'definitions') {
            // we are at the root here, only allow some values
            widget.options = allowedObjects
        } else if (left.last() === 'properties') {
            // are special because they are defining the props that available on the top level objects: ticket, event, etc..
            const props = schemas.getIn(left).toJS()
            for (const key of Object.keys(props)) {
                const prop = props[key]
                // only show props that have a meta value
                if (!prop.hasOwnProperty('meta')) {
                    continue
                }
                widget.options.push(key)
                widget.description = prop.description
            }
        } else if (left.last() === 'operators') {
            // operators are using simple select widget, all we need is the options
            const operators = schemas.getIn(left)
            if (operators) {
                widget.options = operators.toJS()
            }
        } else {
            // all other properties
            const right = schemas.getIn(left)
            if (!right) {
                return null
            }

            widget.type = right.getIn(['meta', 'rules', 'widget'])
            if (!widget.type) {
                return null
            }
            widget.description = right.get('description')
            widget.options = right.getIn(['meta', 'enum'])
            if (widget.options) {
                widget.options = widget.options.toJS()
            }
        }

        switch (widget.type) {
            case 'select':
                return (
                    <Select
                        {...widget}
                        handleChange={this.handleChange}
                    />
                )
            case 'input':
                return this.input(value)
            case 'textarea':
                return this.textarea(value)
            default:
                throw Error('Unknown widget type: ' + widget.type)
        }
    }
}

Widget.propTypes = {
    value: PropTypes.any,
    index: PropTypes.number,
    parent: PropTypes.object,
    schemas: PropTypes.object,
    actions: PropTypes.object,
    leftsiblings: PropTypes.object
}
