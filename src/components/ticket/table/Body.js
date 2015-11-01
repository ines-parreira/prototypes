import React from 'react'
import Row from './Row'

export default class Body extends React.Component {
    render() {
        return (
            <tbody className="Body">
            {this.props.rows.map((row) => {
                return <Row row={row} key={row.id} />
            })}
            </tbody>
        )
    }
}
