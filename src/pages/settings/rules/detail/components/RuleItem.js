import React, {PropTypes} from 'react'
import classnames from 'classnames'
import {Button, Form as BootstrapForm, FormGroup} from 'reactstrap'
import _xor from 'lodash/xor'

import InputField from '../../../../common/forms/InputField'
import TriggersSelector from './TriggersSelector'

import EditableTitle from '../../../../common/components/EditableTitle'
import Program from '../../../../common/components/ast/Program'
import Errors from '../../../../common/components/ast/Errors'
import ConfirmButton from '../../../../common/components/ConfirmButton'

import * as rulesHelpers from '../../../../../state/rules/helpers'

class RuleItem extends React.Component {
    state = {
        description: '',
        eventTypes: [],
        isDeactivating: false,
        isDeleting: false,
        isResetting: false,
        isSubmitting: false,
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

        this.setState({isSubmitting: true})
        if (this._canSubmit()) {
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

    _handleReset = () => {
        const {actions, rule} = this.props
        this.setState({isResetting: true})
        return actions.rules.reset(rule.get('id'))
            .then(() => {
                this.setState({isResetting: false})
            })
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

    _handleDeactivate = () => {
        const {actions, rule} = this.props

        this.setState({isDeactivating: true})
        return actions.rules.deactivate(rule.get('id'))
            .then(() => {
                this.setState({isDeactivating: false})
            })
    }

    _handleRemove = () => {
        const {actions, rule} = this.props

        this.setState({isDeleting: true})
        return actions.rules.remove(rule.get('id'))
            .then(() => {
                this.setState({isDeleting: false})
            })
    }

    _handleChangeTriggers = (trigger) => {
        return this.setState({
            eventTypes: _xor(this.state.eventTypes, [trigger])
        })
    }

    _renderButtons() {
        const {rule} = this.props

        const isDeactivated = rule.get('deactivated_datetime')

        return (
            <div className="d-flex justify-content-between">
                <div>
                    <ConfirmButton
                        className="mr-2"
                        color="primary"
                        type="submit"
                        skip={rule.get('type') === 'user'}
                        loading={this.state.isSubmitting}
                        disabled={this.state.isSubmitting || !this._canSubmit()}
                        content="You're about to modify a system rule, this may prevent you from sending messages to your customers. Are you sure?"
                    >
                        Save
                    </ConfirmButton>
                    <ConfirmButton
                        color="secondary"
                        loading={this.state.isResetting}
                        confirm={this._handleReset}
                        content="Are you sure you want to reset this rule?"
                    >
                        Cancel changes
                    </ConfirmButton>
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
                                <ConfirmButton
                                    color="warning"
                                    outline
                                    loading={this.state.isDeactivating}
                                    confirm={this._handleDeactivate}
                                    content="Are you sure you want to deactivate this rule?"
                                >
                                    Deactivate
                                </ConfirmButton>
                            )
                    }
                    {
                        rule.get('type') !== 'system' && (
                            <ConfirmButton
                                className="ml-2"
                                color="danger"
                                outline
                                loading={this.state.isDeleting}
                                confirm={this._handleRemove}
                                content="Are you sure you want to delete this rule?"
                            >
                                Delete rule
                            </ConfirmButton>
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
                    <InputField
                        type="textarea"
                        placeholder="Description"
                        rows="2"
                        value={this.state.description}
                        onChange={value => this.setState({description: value})}
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
                                <Errors inline>You need to select at least one trigger</Errors>
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
