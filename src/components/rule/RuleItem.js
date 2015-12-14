import React, {PropTypes} from 'react'
import Program from '../parser/Program'

export default class RuleItem extends React.Component {
    render() {
        const { index, rule, actions } = this.props

        return (
            <div className="ruleItem item">
                <div className="content">
                    <div className="header">{rule.id}. {rule.type}</div>
                    <div className="ui existing segment">
                    <pre>
                        <code className="code javascript">{ rule.code }</code>
                    </pre>
                    </div>
                    <small>{rule.created_datetime}</small>
                    <Program
                        {...rule.code_ast}
                        index={index}
                        actions={actions}
                        />
                </div>
                <br />
            </div>
        )
    }
}

RuleItem.propTypes = {
    index: PropTypes.number,
    rule: PropTypes.object,
    actions: PropTypes.object
}