import React from 'react'
import RuleItem from './RuleItem'

class RuleList extends React.Component{
    render(){
        var ruleNodes = this.props.data.map(function (rule) {
            return (
                <RuleItem {...rule} key={rule.id} id={rule.id} />
            )
        })
        return (
            <div className="ruleList">
                { ruleNodes }
            </div>
        )
    }
}

export default RuleList