import React from 'react'

import Program from '../../../common/components/ast/Program'

const RuleItem = ({index, rule, actions, schemas}) => (
    <div className="item">
        <div className="content">
            <div className="header">{rule.id}. {rule.type}</div>
            <div className="ui existing segment">
                <pre>
                    <code className="code javascript">{rule.code}</code>
                </pre>
            </div>
            <small>{rule.created_datetime}</small>
            <Program {...rule.code_ast} index={index} schemas={schemas} actions={actions} />
        </div>
        <br />
    </div>
)

RuleItem.propTypes = {
    index: React.PropTypes.number,
    rule: React.PropTypes.object,
    actions: React.PropTypes.object,
    schemas: React.PropTypes.object,
}

export default RuleItem
