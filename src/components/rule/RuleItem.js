import React from 'react'

const RuleItem = React.createClass({
    render: function () {
        return (
            <div className="ruleItem">
                <div className="title">
                    <h4>{this.props.rule.id}. {this.props.rule.type}
                        <small>{this.props.rule.created_datetime}</small>
                    </h4>
                </div>
                <code>{ this.props.rule.code }</code>
                <br />
            </div>
        )
    }
})

export default RuleItem