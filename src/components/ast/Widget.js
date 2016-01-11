import React, {PropTypes} from 'react'

export default class Widget extends React.Component {
    handleChange(event) {
        const {actions, index, parent} = this.props

        actions.modifyCodeast(index, parent, event.target.value, 'UPDATE')
        // console.log(actions.modifyCodeast)
    }

    select(value, options) {
        const neutralBtn = (
        value === 'eq' ||
        value === 'neq' ||
        value === 'gt' ||
        value === 'lt') ? ' neutral' : ''

        return (
            <select
                className={`ui dropdown${neutralBtn}`}
                value={value}
                onChange={this.handleChange.bind(this)}>

                <option value="" key="-1">-- select --</option>
                {Object.keys(options).map((actionKey) => {
                    return (
                        <option
                            value={actionKey}
                            key={actionKey}>{options[actionKey].label}</option>
                    )
                })}
            </select>
        )
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

        if (!schemas || !leftsiblings) {
            return null
        }

        // add options in bet
        let path = []
        const tmp = leftsiblings.toJS()
        if (tmp.length === 2) {
            tmp.splice(1, 0, 'options')
            path = tmp
        } else {
            for (let i = 0; i < tmp.length; i++) {
                path.push(tmp[i])
                if (i < tmp.length - 1) {
                    path.push('options')
                    if (i === (tmp.length - 2) && leftsiblings.last() === 'operators') {
                        path.pop()
                    }
                }
            }
        }

        console.log('path', path)
        console.log('left', leftsiblings.toJS())

        const right = schemas.getIn(path)
        if (!right) {
            return null
        }
        console.log('right', right.toJS())

        let widget = {
            type: 'select',
            options: []
        }

        // Operators are special because they are always a select input, we only need the options
        if (leftsiblings.last() === 'operators') {
            widget.options = right.toJS()
        } else {
            widget.options = right.get('options')
            // todo(@xarg): treat url based options
            if (widget.options && typeof widget.options !== 'string') {
                widget.options = widget.options.toJS()
            }
            widget.type = right.get('widget', 'select')
        }

        switch (widget.type) {
            case 'select':
                return this.select(value, widget.options)
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
    index: PropTypes.number,
    parent: PropTypes.object,
    schemas: PropTypes.object,
    actions: PropTypes.object,
    leftsiblings: PropTypes.object
}
