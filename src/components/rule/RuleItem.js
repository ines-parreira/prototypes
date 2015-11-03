import React from 'react'

class RuleItem extends React.Component {
    render() {
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
                </div>
                <br />
            </div>
        )
    }
}

export default RuleItem