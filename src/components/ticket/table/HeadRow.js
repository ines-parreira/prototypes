import React from 'react'

const HeadRow = React.createClass({
    render() {
        return (
            <tr className="HeadRow">
                {this.params.row.map((field) => {
                    return <th>{field}</th>
                })}
            </tr>
        )
    }
})

export default HeadRow
