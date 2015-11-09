import React from 'react'
import Statement from './Statement'

class Program extends React.Component {
    render() {
        const { type, body } = this.props

        var statements = body.map(function (_statement, idx) {
            return (
                <Statement {..._statement} key={idx} />
            )
        })

        return (
            <div className="program">
                { statements }
            </div>
        )
    }
}

export default Program