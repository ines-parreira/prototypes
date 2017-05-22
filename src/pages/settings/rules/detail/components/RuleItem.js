import React, {PropTypes} from 'react'
import classnames from 'classnames'
import {Button, Form as BootstrapForm, FormGroup} from 'reactstrap'
import _xor from 'lodash/xor'

import {TextAreaField} from '../../../../common/forms'
import TriggersSelector from './TriggersSelector'

import EditableTitle from '../../../../common/components/EditableTitle'
import Program from '../../../../common/components/ast/Program'
import ErrorMessage from '../../../../common/components/ErrorMessage'

import * as rulesHelpers from '../../../../../state/rules/helpers'

class RuleItem extends React.Component {
    state = {
        description: '',
        eventTypes: [],
        isDeactivating: false,
        isDeleting: false,
        isResetting: false,
        isSubmitting: false,
        showCode: false,
        title: '',
    }

    componentDidMount() {
        const {actions, rule} = this.props

        if (!rule.get('code')) {
            actions.rules.initialiseCodeAST(rule.get('id'))
        }

        this.setState({
            description: rule.get('description') || '',
            eventTypes: rulesHelpers.eventTypes(rule),
            title: rule.get('title') || '',
        })
    }

    _canSubmit = () => {
        return this.state.eventTypes.length > 0
    }

    _handleSubmit = (event) => {
        const {actions, rule} = this.props

        event.preventDefault()

        const confirmMsg = 'You\'re about to modify a system rule, this may prevent you from sending ' +
            'messages to your customers. Are you sure?'

        this.setState({isSubmitting: true})
        if (this._canSubmit() && (this.props.rule.get('type') === 'user' || confirm(confirmMsg))) {
            return actions.rules.save({
                id: rule.get('id'),
                description: this.state.description,
                event_types: this.state.eventTypes.join(','),
                title: this.state.title,
                code: rule.get('code'),
                code_ast: rule.get('code_ast'),
            }).then(() => {
                this.setState({isSubmitting: false})
            })
        }
    }

    _handleReset = (event) => {
        const {actions, rule} = this.props
        event.preventDefault()

        if (confirm('Are you sure you want to reset this rule?')) {
            this.setState({isResetting: true})
            return actions.rules.reset(rule.get('id'))
                .then(() => {
                    this.setState({isResetting: false})
                })
        }
    }

    _handleActivate = (event) => {
        const {actions, rule} = this.props
        event.preventDefault()
        this.setState({isDeactivating: true})
        return actions.rules.activate(rule.get('id'))
            .then(() => {
                this.setState({isDeactivating: false})
            })
    }

    _handleDeactivate = (event) => {
        const {actions, rule} = this.props
        event.preventDefault()

        if (confirm('Are you sure you want to deactivate this rule?')) {
            this.setState({isDeactivating: true})
            return actions.rules.deactivate(rule.get('id'))
                .then(() => {
                    this.setState({isDeactivating: false})
                })
        }
    }

    _handleRemove = (event) => {
        const {actions, rule} = this.props
        event.preventDefault()

        if (confirm('Are you sure you want to delete this rule?')) {
            this.setState({isDeleting: true})
            return actions.rules.remove(rule.get('id'))
                .then(() => {
                    this.setState({isDeleting: false})
                })
        }
    }

    _handleToggleCode = () => {
        return this.setState({
            showCode: !this.state.showCode
        })
    }

    _handleChangeTriggers = (trigger) => {
        return this.setState({
            eventTypes: _xor(this.state.eventTypes, [trigger])
        })
    }

    _renderToggleCode() {
        const toggleClasses = classnames('angle cursor icon', {
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
        const {rule} = this.props

        const isDeactivated = rule.get('deactivated_datetime')

        return (
            <div className="d-flex justify-content-between">
                <div>
                    <Button
                        color="primary"
                        type="submit"
                        className={classnames('mr-2', {
                            'btn-loading': this.state.isSubmitting,
                        })}
                        disabled={this.state.isSubmitting || !this._canSubmit()}
                    >
                        Save
                    </Button>
                    <Button
                        color="secondary"
                        type="button"
                        className={classnames({
                            'btn-loading': this.state.isResetting,
                        })}
                        disabled={this.state.isResetting}
                        onClick={this._handleReset}
                    >
                        Cancel changes
                    </Button>
                </div>
                <div className="pull-right">
                    {
                        isDeactivated ? (
                                <Button
                                    color="primary"
                                    type="button"
                                    className={classnames({
                                        'btn-loading': this.state.isDeactivating,
                                    })}
                                    disabled={this.state.isDeactivating}
                                    onClick={this._handleActivate}
                                >
                                    Activate
                                </Button>
                            ) : (
                                <Button
                                    color="warning"
                                    type="button"
                                    outline
                                    className={classnames({
                                        'btn-loading': this.state.isDeactivating,
                                    })}
                                    disabled={this.state.isDeactivating}
                                    onClick={this._handleDeactivate}
                                >
                                    Deactivate
                                </Button>
                            )
                    }
                    {
                        rule.get('type') !== 'system' && (
                            <Button
                                className={classnames('ml-2', {
                                    'btn-loading': this.state.isDeleting,
                                })}
                                disabled={this.state.isDeleting}
                                color="danger"
                                type="button"
                                outline
                                onClick={this._handleRemove}
                            >
                                Delete rule
                            </Button>
                        )
                    }
                </div>
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
            <BootstrapForm onSubmit={this._handleSubmit}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <EditableTitle
                        title={this.state.title}
                        placeholder="Name"
                        size="md"
                        update={name => this.setState({title: name})}
                    />
                    <i
                        className="fa fa-fw fa-close clickable pull-right"
                        onClick={this.props.toggleOpening}
                    />
                </div>
                <FormGroup>
                    <TextAreaField
                        placeholder="Description"
                        rows="2"
                        input={{
                            value: this.state.description,
                            onChange: e => this.setState({description: e.target.value}),
                        }}
                    />
                </FormGroup>
                <FormGroup className="mb-4">
                    <div
                        className="d-flex align-items-center"
                        style={{marginBottom: '10px'}}
                    >
                        <Button
                            className="btn-frozen"
                            color="info"
                            type="button"
                            style={{marginRight: '5px'}}
                        >
                            WHEN
                        </Button>
                        <TriggersSelector
                            triggers={this.state.eventTypes}
                            onChange={this._handleChangeTriggers}
                        />
                        {
                            this.state.eventTypes.length === 0 && (
                                <ErrorMessage
                                    key="errors"
                                    className="m0i ml15i p5i"
                                    errors="You need to select at least one trigger"
                                    inline
                                />
                            )
                        }
                    </div>
                    <Program
                        {...codeAST}
                        rule={rule}
                        actions={actions}
                        triggers={this.state.eventTypes}
                        onChangeTriggers={this._handleChangeTriggers}
                    />
                </FormGroup>

                {this._renderButtons()}
            </BootstrapForm>
        )
    }
}

RuleItem.propTypes = {
    rule: PropTypes.object,
    actions: PropTypes.object,
    toggleOpening: PropTypes.func.isRequired,
}

export default RuleItem
