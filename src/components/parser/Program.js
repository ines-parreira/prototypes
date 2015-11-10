import React from 'react'
import Statement from './Statement'
import Immutable from 'immutable'

class Program extends React.Component {
    render() {
        const { type, body, index, actions } = this.props

        var statements = body.map(function (_statement, idx) {
            var _parent = Immutable.List(['body', idx])

            return (
                <Statement {..._statement} key={idx} parent={_parent} index={index} actions={actions}/>
            )
        })

        return (
            <div className="program">
                { statements }
            </div>
        )
    }

    function deserialize() {
        var tree = {type: 'Program', "body": []}
        for (child in this.props.children) {
            tree.body.push(child.deserialize())
        }

        return tree
    }
}

export default Program