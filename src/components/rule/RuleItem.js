import React from 'react'

class RuleItem extends React.Component{
    render(){
        return (
            <div className="ruleItem item">
                <div className="content">
                    <div className="header">{this.props.id}. {this.props.title}</div>
                    <code>{ this.props.code }</code>
                    <small>{this.props.created_datetime}</small>
                </div>
                <br />
            </div>
        )
    }
}

export default RuleItem