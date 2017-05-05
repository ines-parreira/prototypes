import React from 'react'
import classNames from 'classnames'
import {Button} from 'reactstrap'

import Program from '../../../../common/components/ast/Program'

class RuleItem extends React.Component {
    constructor() {
        super()
        this.state = {showCode: false}
    }

    componentDidMount() {
        const {actions, rule} = this.props

        if (!rule.get('code')) {
            actions.rules.initialiseCodeAST(rule.get('id'))
        }
    }

    _handleSubmit = (event) => {
        const {actions, rule} = this.props

        event.preventDefault()

        const confirmMsg = 'You\'re about to modify a system rule, this may prevent you from sending ' +
            'messages to your customers. Are you sure?'

        if (rule.get('type') === 'user' || confirm(confirmMsg)) {
            actions.rules.save({
                id: rule.get('id'),
                title: rule.get('title'),
                code: rule.get('code'),
                code_ast: rule.get('code_ast'),
            })
        }
    }

    _handleReset = (event) => {
        const {actions, rule} = this.props
        event.preventDefault()

        if (confirm('Are you sure you want to reset this rule?')) {
            actions.rules.reset(rule.get('id'))
        }
    }

    _handleActivate = (event) => {
        const {actions, rule} = this.props
        event.preventDefault()
        actions.rules.activate(rule.get('id'))
    }

    _handleDeactivate = (event) => {
        const {actions, rule} = this.props
        event.preventDefault()

        if (confirm('Are you sure you want to deactivate this rule?')) {
            actions.rules.deactivate(rule.get('id'))
        }
    }

    _handleRemove = (event) => {
        const {actions, rule} = this.props
        event.preventDefault()

        if (confirm('Are you sure you want to delete this rule?')) {
            actions.rules.remove(rule.get('id'))
        }
    }

    _handleToggleCode = () => {
        this.setState({
            showCode: !this.state.showCode
        })
    }

    _renderToggleCode() {
        const toggleClasses = classNames('angle cursor icon', {
            up: this.state.showCode,
            down: !this.state.showCode
        })
        return (
            <div>
                <a className="ui red ribbon label" title="The code behind the scenes" onClick={this._handleToggleCode}>
                    <i className="code icon" /> Code
                </a>
                <a className="ui floated right" title="Toggle code" onClick={this._handleToggleCode}>
                    <i className={toggleClasses} />
                </a>
            </div>
        )
    }

    _renderCode() {
        const {rule} = this.props
        const code = rule.get('code')
        if (this.state.showCode) {
            return (
                <pre>
                     <code>{code && code.trim()}</code>
                 </pre>
            )
        }
        return null
    }

    _renderButtons() {
        const {rule, isDirty} = this.props

        let primaryBtn = (
            <Button
                color="primary"
                type="submit"
                className="mr-2"
                disabled={!isDirty}
            >
                Save
            </Button>
        )
        let resetBtn = (
            <Button
                color="secondary"
                type="button"
                disabled={!isDirty}
                onClick={this._handleReset}
            >
                Cancel changes
            </Button>
        )
        let rmBtn = (
            <Button
                color="warning"
                type="button"
                onClick={this._handleDeactivate}
            >
                Deactivate rule
            </Button>

        )

        if (rule.get('deactivated_datetime')) {
            primaryBtn = (
                <Button
                    color="primary"
                    type="button"
                    onClick={this._handleActivate}
                >
                    Re-activate
                </Button>
            )
            resetBtn = null
            rmBtn = (
                <Button
                    color="danger"
                    outline
                    type="button"
                    disabled={rule.get('type') === 'system'}
                    onClick={this._handleRemove}
                >
                    Delete rule
                </Button>
            )
        }

        return (
            <div className="ui aligned segment">
                {primaryBtn}
                {resetBtn}
                {
                    !!rmBtn && (
                        <div className="pull-right">
                            {rmBtn}
                        </div>
                    )
                }
            </div>
        )
    }


    render() {
        const {rule, actions} = this.props
        let codeAST = rule.get('code_ast')
        if (codeAST) {
            codeAST = codeAST.toJS()
        }

        return (
            <form onSubmit={this._handleSubmit}>
                <div className="item">
                    <div className="ui segments">
                        <Program
                            {...codeAST}
                            rule={rule}
                            actions={actions}
                        />
                        {this._renderButtons()}
                    </div>
                </div>
            </form>
        )
    }
}

RuleItem.propTypes = {
    rule: React.PropTypes.object,
    actions: React.PropTypes.object,
    isDirty: React.PropTypes.bool
}

export default RuleItem
