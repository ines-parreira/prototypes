import React from 'react'
import _ from 'lodash'

export default class HeadRow extends React.Component {
    render() {
        return (
            <tr className="HeadRow">
                {this.props.row.map((field, i) => {
                    return <th key={i}>{field}</th>
                })}
            </tr>
        )
    }
}
