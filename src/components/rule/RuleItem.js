import React from 'react'
import esprima from 'esprima'
import Program from '../parser/Program'

class RuleItem extends React.Component {
    render() {
        var syntax = esprima.parse(this.props.code)

        return (
            <div className="ruleItem item">
                <div className="content">
                    <div className="header">{this.props.id}. {this.props.type}</div>
                    <div className="ui existing segment">
                    <pre>
                        <code className="code javascript">{ this.props.code }</code>
                    </pre>
                    </div>
                    <small>{this.props.created_datetime}</small>
                    <Program {...syntax} />
                </div>
                <br />
            </div>
        )
    }
}

export default RuleItem