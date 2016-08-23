import React, {PropTypes} from 'react'
import RuleItem from './RuleItem'

export default class RuleList extends React.Component {
    render() {
        const { actions, rules, schemas } = this.props
        return (
            <div className="ui middle aligned divided list">
                { rules.map((rule, idx) => {
                    return (
                        <RuleItem
                            key={rule.id}
                            index={idx}
                            rule={rule}
                            schemas={schemas}
                            actions={actions} />
                    )
                }) }
            </div>
        )
    }
}

RuleList.propTypes = {
    rules: PropTypes.object.isRequired,
    schemas: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
}
