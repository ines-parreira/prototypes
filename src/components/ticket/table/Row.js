import React from 'react'

const Row = React.createClass({
    render() {
        return (
            <tr className="Row">
                {this.params.row.map((field) => {
                    return <td>{field}</td>
                })}
            </tr>
        )
    }
})

export default Row