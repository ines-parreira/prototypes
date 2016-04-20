import React, { PropTypes } from 'react'
import classNames from 'classnames'


export default class PlainColumnHeader extends React.Component {
    render = () => {
        const column = this.props.column
        const style = { width: column.width }
        const className = classNames(column.name, 'wide', 'column')
        const sort = column.sortable ? <i className="sort icon"/> : null
        const onClick = this.props.onClick || (() => {})

        return (
            <div style={style} className={className} onClick={onClick}>
                <span>{column.header} {sort}</span>
            </div>
        )
    }
}

PlainColumnHeader.propTypes = {
    column: PropTypes.object.isRequired,
    onClick: PropTypes.func
}
