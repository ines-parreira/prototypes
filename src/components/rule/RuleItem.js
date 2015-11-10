import React from 'react'
import esprima from 'esprima'
import Program from '../parser/Program'

class RuleItem extends React.Component {
    render() {
        const { id, type, code, code_ast, index, actions, created_datetime } = this.props

        return (
            <div className="ruleItem item">
                <div className="content">
                    <div className="header">{id}. {type}</div>
                    <div className="ui existing segment">
                    <pre>
                        <code className="code javascript">{ code }</code>
                    </pre>
                    </div>
                    <small>{created_datetime}</small>
                    <Program {...code_ast} index={index} actions={actions} />
                </div>
                <br />
            </div>
        )
    }
}

export default RuleItem