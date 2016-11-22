import React, {PropTypes, Component} from 'react'
import classNames from 'classnames'

export default class ColumnHeader extends Component {
    static propTypes = {
        view: PropTypes.object.isRequired,
        field: PropTypes.object.isRequired,
        updateView: PropTypes.func.isRequired,
        onClick: PropTypes.func
    }

    renderOrderIcon = (orderOnClick) => {
        const {view} = this.props
        const field = this.props.field.toJS()
        const orderDir = view.get('order_dir')
        let orderClasses = 'action sort icon'

        if (field.name === view.get('order_by')) {
            orderClasses = classNames(orderClasses, 'caret', {
                up: orderDir === 'desc',
                down: orderDir === 'asc'
            })
        }

        return <i className={orderClasses} onClick={orderOnClick}/>
    }

    render = () => {
        const {updateView, view} = this.props
        const field = this.props.field.toJS()

        // One small exception for priority which is displayed without header
        if (field.name === 'priority') {
            return null
        }

        const isFilterable = field.filter && !field.filter.sort
        const isSortable = field.filter && field.filter.sort
        // editMode can be undefined, but we need it boolean
        const editMode = !!view.get('editMode')
        const orderDir = view.get('order_dir')
        const newOrderDir = orderDir === 'desc' ? 'asc' : 'desc'
        let onClick = () => {}
        let orderOnClick = null

        if (isSortable) {
            orderOnClick = () => updateView(view.merge({
                order_by: field.name,
                order_dir: newOrderDir
            }), editMode)
            onClick = orderOnClick
        }

        if (isFilterable) {
            onClick = this.props.onClick
        }

        return (
            <span
                className={classNames(field.name, 'wide', 'field')}
                onClick={isFilterable ? onClick : orderOnClick}
            >
                <span className="plain-column-header-label">
                    <span className={classNames({'text-underline': isFilterable})}>
                        {field.title}
                    </span>
                    {isSortable ? this.renderOrderIcon(orderOnClick) : ''}
                </span>
            </span>
        )
    }
}
