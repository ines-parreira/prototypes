import React from 'react'
import Statement from './Statement'
import Immutable from 'immutable'

class Program extends React.Component {
    render() {
        const { type, body, index, actions } = this.props

        const statements = body.map(function(statement, idx) {
            const parentNew = Immutable.List(['body', idx])

            return (
                <Statement {...statement} key={idx} parent={parentNew} index={index} actions={actions}/>
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