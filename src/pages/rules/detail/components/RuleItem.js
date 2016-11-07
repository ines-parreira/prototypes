import React from 'react'
import classNames from 'classnames'

import Program from '../../../common/components/ast/Program'

class RuleItem extends React.Component {
    constructor() {
        super()
        this.state = {showCode: true}
    }

    componentDidMount() {
        const {actions, index, rule} = this.props

        if (!rule.code) {
            actions.rules.initialiseCodeAST(index)
        }
    }

    _handleSubmit = (event) => {
        const {actions, rule} = this.props

        event.preventDefault()
        actions.rules.save({
            id: rule.id,
            title: rule.title,
            code: rule.code,
            code_ast: rule.code_ast,
        })
    }

    _handleReset = (event) => {
        const {actions, index} = this.props
        event.preventDefault()

        if (confirm('Are you sure you want to reset this rule?')) {
            actions.rules.reset(index)
        }
    }

    _handleActivate = (event) => {
        const {actions, index} = this.props
        event.preventDefault()
        actions.rules.activate(index)
    }

    _handleDeactivate = (event) => {
        const {actions, index} = this.props
        event.preventDefault()

        if (confirm('Are you sure you want to deactivate this rule?')) {
            actions.rules.deactivate(index)
        }
    }

    _handleRemove = (event) => {
        const {actions, index} = this.props
        event.preventDefault()

        if (confirm('Are you sure you want to delete this rule?')) {
            actions.rules.remove(index)
        }
    }

    _handleToggleCode = () => {
        this.setState({
            showCode: !this.state.showCode
        })
    }

    _renderToggleCode() {
        const toggleClasses = classNames('angle cursor icon', {
            up: !this.state.showCode,
            down: this.state.showCode
        })
        return (
            <div>
                <a className="ui red ribbon label" title="The code behind the scenes" onClick={this._handleToggleCode}>
                    <i className="code icon"/> Code
                </a>
                <a className="ui floated right" title="Toggle code" onClick={this._handleToggleCode}>
                    <i className={toggleClasses}/>
                </a>
            </div>
        )
    }

    _renderCode() {
        const {rule} = this.props
        if (this.state.showCode) {
            return (
                <pre>
                    <code>{rule.code && rule.code.trim()}</code>
                </pre>
            )
        }
        return null
    }

    _renderButtons() {
        const {rule} = this.props

        let rmBtn = (
            <button
                type="button"
                className="ui left floated icon basic red button"
                onClick={this._handleDeactivate}
            >
                Deactivate Rule
            </button>

        )
        let resetBtn = (
            <button
                type="button"
                className="ui button"
                onClick={this._handleReset}
            >
                Cancel Changes
            </button>
        )
        let primaryBtn = (
            <button
                type="button"
                className="ui positive button"
                onClick={this._handleSubmit}
            >
                Save Changes
            </button>
        )

        if (rule.deactivated_datetime) {
            rmBtn = (
                <button
                    type="button"
                    className="ui left floated icon basic red button"
                    onClick={this._handleRemove}
                >
                    Delete Rule
                </button>
            )
            primaryBtn = (
                <button
                    type="button"
                    className="ui positive button"
                    onClick={this._handleActivate}
                >
                    Re-Activate
                </button>
            )
            resetBtn = null
        }
        return (
            <div className="ui right aligned segment">
                {rmBtn}
                {resetBtn}
                {primaryBtn}
            </div>
        )
    }


    render() {
        const {index, rule, actions, schemas} = this.props


        return (
            <div className="item">
                <div className="ui segments">
                    <div className="ui segment">
                        {this._renderToggleCode()}
                        <p />
                        {this._renderCode()}
                    </div>
                    <Program {...rule.code_ast} index={index} schemas={schemas} actions={actions}/>
                    {this._renderButtons()}
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
