import React from 'react'

import Program from '../../../common/components/ast/Program'

class RuleItem extends React.Component {

    constructor() {
        super()
        this.state = { code: false }
    }

    componentDidMount() {
        const { actions, index, rule } = this.props

        if (!rule.code) {
            actions.rules.initialiseCodeAST(index)
        }
    }

    _handleSubmit = (event) => {
        event.preventDefault()
        const { actions, rule } = this.props
        actions.rules.save({
            id: rule.id,
            title: rule.title,
            code: rule.code,
            code_ast: rule.code_ast,
        })
    }

    _handleReset = (event) => {
        event.preventDefault()
        const { actions, index } = this.props

        if (confirm('Are you sure to reset this rule?')) {
            actions.rules.reset(index)
        }
    }

    render() {
        const { index, rule, actions, schemas } = this.props
        return (
            <div className="item">
                <div className="ui segments">
                    <div className="ui segment">
                        <pre>
                            <code>{rule.code && rule.code.trim()}</code>
                        </pre>
                    </div>
                    <Program {...rule.code_ast} index={index} schemas={schemas} actions={actions} />
                    <div className="ui right aligned segment">
                        <button
                            type="button"
                            className="ui button"
                            onClick={this._handleReset}
                        >
                            Reset
                        </button>
                        <button
                            type="button"
                            className="ui positive button"
                            onClick={this._handleSubmit}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        )
    }

}

RuleItem.propTypes = {
    index: React.PropTypes.number,
    rule: React.PropTypes.object,
    actions: React.PropTypes.object,
    schemas: React.PropTypes.object,
}

export default RuleItem
