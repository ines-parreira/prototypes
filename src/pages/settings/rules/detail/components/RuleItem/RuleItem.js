// @flow
import React from 'react'
import classnames from 'classnames'
import {fromJS, Map} from 'immutable'
import {
    Button,
    Form as BootstrapForm,
    FormGroup,
    Popover,
    PopoverBody,
    PopoverHeader,
} from 'reactstrap'

import InputField from '../../../../../common/forms/InputField'
import SelectField from '../../../../../common/forms/MultiSelectField'
import * as rulesConfig from '../../../../../../config/rules.ts'

import EditableTitle from '../../../../../common/components/EditableTitle'
import Program from '../../../../../common/components/ast/Program.tsx'
import Errors from '../../../../../common/components/ast/Errors'
import ConfirmButton from '../../../../../common/components/ConfirmButton.tsx'

import * as rulesHelpers from '../../../../../../state/rules/helpers.ts'

import {toJS} from '../../../../../../utils.ts'
import ToggleButton from '../../../../../common/components/ToggleButton'
import {getMomentUtcISOString} from '../../../../../../utils/date.ts'

import css from './RuleItem.less'

type Props = {
    rule: Map<*, *>,
    actions: Object,
    notify: (Object) => void,
    toggleOpening: (number) => void,
    canDuplicate: boolean,
}

type State = {
    description: string,
    eventTypes: Array<string>,
    isDeactivating: boolean,
    isDeleting: boolean,
    isResetting: boolean,
    isSubmitting: boolean,
    name: string,
    showConfirmation: boolean,
}

export default class RuleItem extends React.Component<Props, State> {
    state = {
        description: '',
        eventTypes: [],
        isDeactivating: false,
        isDeleting: false,
        isResetting: false,
        isSubmitting: false,
        name: '',
        showConfirmation: false,
    }

    componentDidMount() {
        const {actions, rule} = this.props

        if (!rule.get('code')) {
            actions.rules.initialiseCodeAST(rule.get('id'))
        }

        this.setState({
            description: rule.get('description') || '',
            eventTypes: rulesHelpers.eventTypes(rule),
            name: rule.get('name') || '',
        })
    }

    _toggleConfirmation = () => {
        this.setState({showConfirmation: !this.state.showConfirmation})
    }

    _canSubmit = () => {
        return this.state.eventTypes.length > 0
    }

    _handleSubmit = (event: Event) => {
        event.preventDefault()

        const {actions, rule} = this.props

        this.setState({isSubmitting: true})
        if (this._canSubmit()) {
            return actions.rules
                .save({
                    id: rule.get('id'),
                    description: this.state.description,
                    event_types: this.state.eventTypes.join(','),
                    name: this.state.name,
                    code: rule.get('code'),
                    code_ast: rule.get('code_ast'),
                })
                .then(() => {
                    this.setState({isSubmitting: false})
                })
        }
    }

    _handleReset = () => {
        const {actions, rule} = this.props
        this.setState({isResetting: true})
        return actions.rules.reset(rule.get('id')).then(() => {
            this.setState({
                isResetting: false,
                eventTypes: rulesHelpers.eventTypes(rule),
            })
        })
    }

    _handleActivate = () => {
        const {actions, rule} = this.props
        this.setState({isDeactivating: true})
        return actions.rules.activate(rule.get('id')).then(() => {
            this.setState({isDeactivating: false})
        })
    }

    _handleDeactivate = () => {
        const {actions, rule} = this.props

        this.setState({isDeactivating: true})
        return actions.rules.deactivate(rule.get('id')).then(() => {
            this.setState({isDeactivating: false})
            this._toggleConfirmation()
        })
    }

    _handleRemove = () => {
        const {actions, rule} = this.props

        this.setState({isDeleting: true})
        return actions.rules.remove(rule.get('id')).then(() => {
            this.setState({isDeleting: false})
        })
    }

    _handleChangeEvents = (value: Array<string>) => {
        return this.setState({
            eventTypes: value,
        })
    }

    _toggleItemStatus = () => {
        const checked = !!this.props.rule.get('deactivated_datetime')
        if (checked) {
            this._handleActivate()
        } else {
            this._toggleConfirmation()
        }
    }

    handleRuleDuplicate = () => {
        const {actions, rule, canDuplicate, notify} = this.props
        if (canDuplicate) {
            this.setState({isSubmitting: true})
            if (this._canSubmit()) {
                let name = this.state.name

                if (name === rule.get('name')) {
                    name = `${name} - copy`
                }

                return actions.rules
                    .create({
                        description: this.state.description,
                        event_types: this.state.eventTypes.join(','),
                        name,
                        code: rule.get('code'),
                        code_ast: rule.get('code_ast'),
                        deactivated_datetime: getMomentUtcISOString(),
                    })
                    .then(({rule: newRule}) => {
                        this.setState({isSubmitting: false})

                        this._handleReset() // reset this rule, as we only want the last changes in the new rule
                        this.props.toggleOpening(rule.get('id')) // close this rule...
                        this.props.toggleOpening(newRule.id) // ...and open the new one
                    })
            }
        } else {
            notify({
                message:
                    'Your account has reached the rule limit. To add more rules, please delete any inactive rules.',
                status: 'error',
            })
        }
    }

    _renderButtons() {
        const {rule} = this.props

        return (
            <div className={css['buttons-container']}>
                <div>
                    <Button
                        id={`rule-item-save-${rule.get('id')}`}
                        color="success"
                        type="submit"
                        disabled={this.state.isSubmitting || !this._canSubmit()}
                        form={`rule-form-${rule.get('id')}`}
                    >
                        Save rule
                    </Button>
                    <Button
                        id={`rule-item-duplicate-${rule.get('id')}`}
                        color="secondary"
                        type="submit"
                        className="ml-3"
                        disabled={this.state.isSubmitting || !this._canSubmit()}
                        onClick={this.handleRuleDuplicate}
                    >
                        Duplicate rule
                    </Button>
                    <ConfirmButton
                        id={`rule-item-discard-${rule.get('id')}`}
                        color="secondary"
                        className="ml-3"
                        loading={this.state.isResetting}
                        confirm={this._handleReset}
                        content="Are you sure you want to reset this rule?"
                    >
                        Discard changes
                    </ConfirmButton>
                </div>
                <div>
                    <ConfirmButton
                        id={`rule-item-delete-${rule.get('id')}`}
                        color="secondary"
                        className={classnames('ml-2', css['delete-button'])}
                        loading={this.state.isDeleting}
                        confirm={this._handleRemove}
                        content="Are you sure you want to delete this rule?"
                    >
                        <i className="material-icons">delete</i>
                        Delete rule
                    </ConfirmButton>
                </div>
            </div>
        )
    }

    render() {
        const {rule, actions} = this.props
        const {description, eventTypes, name, showConfirmation} = this.state
        const toggleId = `rule-toggle-${rule.get('id')}`

        let codeAST = rule.get('code_ast')

        if (codeAST) {
            codeAST = codeAST.toJS()
        }

        let dependentEvents = rulesHelpers.getArraysIntersection(
            rulesConfig.eventsDependencies['ticket-updated'],
            eventTypes
        )
        dependentEvents = dependentEvents.map((event) => {
            return rulesConfig.eventNameToLabel[event]
        })
        const containsDependentEvents =
            eventTypes.includes('ticket-updated') && dependentEvents.length > 0

        return (
            <tr
                id={rule.get('id')}
                key={rule.get('id')}
                data-id={rule.get('id')} // dragging info
                className={`container ${css.container}`}
            >
                <td colSpan="3">
                    <div className={css.row}>
                        <div className={classnames(css.col, css['left-col'])}>
                            <i
                                className={classnames(
                                    'material-icons',
                                    css.closeRuleIcon
                                )}
                                onClick={() =>
                                    this.props.toggleOpening(rule.get('id'))
                                }
                            >
                                keyboard_arrow_down
                            </i>
                        </div>
                        <div className={classnames(css.col, css['center-col'])}>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <EditableTitle
                                    title={name}
                                    placeholder="Name"
                                    size="md"
                                    className={classnames(
                                        'font-weight-bold',
                                        css.name
                                    )}
                                    onChange={(value) =>
                                        this.setState({name: value})
                                    }
                                />
                            </div>
                            <FormGroup className="mb-0">
                                <InputField
                                    className={css['rule-description']}
                                    type="textarea"
                                    placeholder="Description"
                                    rows="1"
                                    value={description}
                                    onChange={(value) =>
                                        this.setState({description: value})
                                    }
                                />
                            </FormGroup>
                        </div>
                        <div
                            className={classnames(
                                css.col,
                                css['right-col'],
                                'position-relative'
                            )}
                        >
                            <ToggleButton
                                value={!rule.get('deactivated_datetime')}
                                onChange={this._toggleItemStatus}
                            />
                            <div
                                className={css['confirmation-popover']}
                                id={toggleId}
                            />
                            <Popover
                                placement="left"
                                isOpen={showConfirmation}
                                target={toggleId}
                                toggle={this._toggleConfirmation}
                                trigger="legacy"
                            >
                                <PopoverHeader>Are you sure?</PopoverHeader>
                                <PopoverBody>
                                    <p>
                                        Are you sure you want to deactivate this
                                        rule?
                                    </p>

                                    <Button
                                        type="submit"
                                        color="success"
                                        onClick={this._handleDeactivate}
                                    >
                                        Confirm
                                    </Button>
                                </PopoverBody>
                            </Popover>
                        </div>
                    </div>

                    <div className={css.row}>
                        <div className="full-width">
                            <BootstrapForm
                                id={`rule-form-${rule.get('id')}`}
                                onSubmit={this._handleSubmit}
                            >
                                <FormGroup className="mb-1">
                                    <div className={css['when-container']}>
                                        <div className={css['when-btn']}>
                                            WHEN
                                        </div>
                                        <SelectField
                                            values={eventTypes}
                                            options={rulesConfig.events.toJS()}
                                            singular="event"
                                            plural="events"
                                            onChange={this._handleChangeEvents}
                                            className={css['when-events']}
                                        />
                                        {eventTypes.length === 0 && (
                                            <Errors inline>
                                                You need to select at least one
                                                trigger
                                            </Errors>
                                        )}
                                        {containsDependentEvents && (
                                            <Errors inline>
                                                <b>
                                                    {dependentEvents.join(', ')}
                                                </b>{' '}
                                                already covered by{' '}
                                                <b>ticket updated</b>
                                            </Errors>
                                        )}
                                    </div>
                                    <Program
                                        {...codeAST}
                                        rule={rule}
                                        actions={{
                                            modifyCodeAST: (...args) => {
                                                return actions.rules.modifyCodeAST(
                                                    rule.get('id'),
                                                    ...args
                                                )
                                            },
                                            getCondition: (path) =>
                                                rule.getIn(
                                                    ['code_ast'].concat(
                                                        toJS(path)
                                                    )
                                                ) || fromJS({}),
                                        }}
                                        triggers={eventTypes}
                                    />
                                </FormGroup>
                            </BootstrapForm>
                        </div>
                    </div>

                    <div className={css.row}>{this._renderButtons()}</div>
                </td>
            </tr>
        )
    }
}
