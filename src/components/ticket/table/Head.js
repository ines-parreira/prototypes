import React from 'react'

export default class Head extends React.Component {
    render() {
        return (
            <thead className="Head">
                <tr>
                    {this.props.rows.map((row, i) => {
                        return <th key={i}>{row}</th>
                    })}
                </tr>
            </thead>
        )
    }
}
