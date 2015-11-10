import React from 'react'
import RuleItem from './RuleItem'

class RuleList extends React.Component{
    render(){
        const {actions } = this.props
        var ruleNodes = this.props.data.map(function (rule, idx) {
            return (
                <RuleItem {...rule} key={rule.id} id={rule.id} index={idx} actions={actions} />
            )
        })
        return (
            <div className="ui middle aligned divided list">
                { ruleNodes }
            </div>
        )
    }
}

export default RuleList