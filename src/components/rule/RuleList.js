import React from 'react'
import RuleItem from './RuleItem'

const RuleList = React.createClass({
    render: function () {
        var ruleNodes = this.props.data.map(function (rule) {
            return (
                <RuleItem rule={rule} key={rule.id}/>
            )
        })
        return (
            <div className="ruleList">
                { ruleNodes }
            </div>
        )
    }
})

export default RuleList