import React from 'react'
import HeadRow from './HeadRow'

const Head = React.createClass({
    render() {
        return (
            <thead className="Head">
            {this.props.rows.map((row) => {
                return <HeadRow row={row} key={row.key} />
            })}
            </thead>
        )
    }
})

export default Head