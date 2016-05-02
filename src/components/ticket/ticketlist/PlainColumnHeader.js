import React, { PropTypes } from 'react'
import classNames from 'classnames'


export default class PlainColumnHeader extends React.Component {
    render = () => {
        const { column, sort, currentSort } = this.props
        const style = { width: column.width }
        const className = classNames(column.name, 'wide', 'column')
        let sortIcon = column.sortable ? <i className="action sort icon" onClick={() => sort(column.name)}/> : null
        const onClick = this.props.onClick || (() => {})

        if (currentSort.endsWith('desc') && currentSort.startsWith(column.name)) {
            sortIcon = <i className="action sort caret down icon" onClick={() => sort(column.name)}/>
        } else if (currentSort.endsWith('asc') && currentSort.startsWith(column.name)) {
            sortIcon = <i className="action sort caret up icon" onClick={() => sort(column.name)}/>
        }

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
    sort: PropTypes.func.isRequired,
    currentSort: PropTypes.string.isRequired,
}
