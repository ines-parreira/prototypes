import React from 'react'

const Body = React.createClass({
    render() {
        return (
            <tbody className="Body">
            {this.props.rows.map((row) => {
                return <Row row={row} key={row.key} />
            })}
            </tbody>
        )
    }
})

export default Body