import React from 'react'
import _ from 'lodash'

export default class Row extends React.Component {
    render() {
        return (
            <tr className="Row">
                {_.map(this.props.row, (value, field) => {
                    return (<td key={field}>
                        {value}
                    </td>)
                })}
            </tr>
        )
    }
}
