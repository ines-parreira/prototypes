import React, { PropTypes } from 'react'
import classNames from 'classnames'


export default class PlainColumnHeader extends React.Component {
    render = () => {
        const { column, sort } = this.props
        const style = { width: column.width }
        const className = classNames(column.name, 'wide', 'column')
        const sortIcon = column.sortable ? <i className="sort icon" onClick={() => sort(column.name)}/> : null
        const onClick = this.props.onClick || (() => {})

        return (
            <div style={style} className={className} onClick={onClick}>
                <span>{column.header} {sortIcon}</span>
            </div>
        )
    }
}

PlainColumnHeader.propTypes = {
    column: PropTypes.object.isRequired,
    onClick: PropTypes.func,
    sort: PropTypes.func.isRequired
}
