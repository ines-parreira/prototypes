import React from 'react'

class RuleItem extends React.Component{
    render(){
        return (
            <div className="ruleItem">
                <div className="title">
                    <h4>{this.props.id}. {this.props.title}
                        <small>{this.props.created_datetime}</small>
                    </h4>
                </div>
                <code>{ this.props.code }</code>
                <br />
            </div>
        )
    }
}

export default RuleItem