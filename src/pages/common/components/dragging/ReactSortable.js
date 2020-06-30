import React from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import Sortable from 'sortablejs'

const store = {
    previousIndex: null,
    activeComponent: null,
}

/**
 * Lighter version of https://github.com/cheton/react-sortable
 * Uses previousIndex instead of sibling to calculate previous position of element
 */
class ReactSortable extends React.Component {
    constructor(props) {
        super(props)

        this.sortable = null
    }

    componentDidMount() {
        const {options, onChange} = this.props
        const eventsNames = [
            'onStart',
            'onEnd',
            'onAdd',
            'onSort',
            'onUpdate',
            'onRemove',
            'onFilter',
            'onMove',
        ]

        eventsNames.forEach((name) => {
            const eventHandler = options[name]

            options[name] = (evt) => {
                if (name === 'onStart') {
                    store.previousIndex = evt.oldIndex
                    store.activeComponent = this
                } else if (
                    (name === 'onAdd' || name === 'onUpdate') &&
                    onChange
                ) {
                    const items = this.sortable.toArray()
                    const remote = store.activeComponent
                    const remoteItems = remote.sortable.toArray()

                    evt.from.insertBefore(
                        evt.item,
                        evt.from.children[store.previousIndex]
                    )

                    if (remote !== this) {
                        const remoteOptions = remote.props.options || {}

                        if (
                            typeof remoteOptions.group === 'object' &&
                            remoteOptions.group.pull === 'clone'
                        ) {
                            // Remove the node with the same data-reactid
                            evt.item.parentNode.removeChild(evt.item)
                        }

                        if (remote.props.onChange) {
                            remote.props.onChange(
                                remoteItems,
                                remote.sortable,
                                evt
                            )
                        }
                    }

                    if (onChange) {
                        onChange(items, this.sortable, evt)
                    }
                }

                setTimeout(() => {
                    if (eventHandler) {
                        eventHandler(evt)
                    }
                }, 0)
            }
        })

        this.sortable = Sortable.create(ReactDOM.findDOMNode(this), options)
    }

    componentWillUnmount() {
        if (this.sortable) {
            this.sortable.destroy()
            this.sortable = null
        }
    }

    render() {
        const {children, className, tag} = this.props
        return React.createElement(tag, {className}, children)
    }
}

ReactSortable.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    options: PropTypes.object,
    onChange: PropTypes.func,
    tag: PropTypes.string,
}

ReactSortable.defaultProps = {
    className: '',
    options: {},
    tag: 'div',
}

export default ReactSortable
