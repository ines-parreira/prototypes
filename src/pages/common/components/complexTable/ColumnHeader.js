import React, {PropTypes} from 'react'
import classNames from 'classnames'


export default class ColumnHeader extends React.Component {
    renderOrderIcon = () => {
        const {view, updateView} = this.props
        const field = this.props.field.toJS()

        if (!(field.filter && field.filter.sort)) { // display order icon only if field is sortable
            return null
        }

        // editMode can be undefined, but we need it boolean
        const editMode = !!(view.get('editMode'))

        const orderDir = view.get('order_dir')
        const newOrderDir = orderDir === 'desc' ? 'asc' : 'desc'
        const onClick = () => updateView(view.merge({
            order_by: field.name,
            order_dir: newOrderDir
        }), editMode)

        let orderClasses = 'action sort icon'
        if (field.name === view.get('order_by')) {
            orderClasses = classNames(orderClasses, 'caret', {
                up: orderDir === 'desc',
                down: orderDir === 'asc'
            })
        }

        return <i className={orderClasses} onClick={onClick}/>
    }

    render = () => {
        const field = this.props.field.toJS()
        const onClick = this.props.onClick || (() => {})

        // One small exception for priority which is displayed without header
        if (field.name === 'priority') {
            return null
        }

        return (
            <span className={classNames(field.name, 'wide', 'field')}
                  onClick={onClick}
            >
                <span className="plain-column-header-label">{field.title} {this.renderOrderIcon()}</span>
            </span>
        )
    }
}

ColumnHeader.propTypes = {
    view: PropTypes.object.isRequired,
    field: PropTypes.object.isRequired,
    updateView: PropTypes.func.isRequired,
    onClick: PropTypes.func
}
