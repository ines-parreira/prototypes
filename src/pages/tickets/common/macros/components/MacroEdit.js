import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import {UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap'

import {generateDefaultAction} from '../../../../../state/macro/utils'

import SetStatusAction from './actions/SetStatusAction'
import SetSubjectAction from './actions/SetSubjectAction'
import SetResponseTextAction from './actions/SetResponseTextAction'
import SetAssigneeAction from './actions/SetAssigneeAction'
import AddTagsAction from './actions/AddTagsAction'
import HttpAction from './actions/HttpAction'
import AddAttachmentsAction from './actions/AddAttachmentsAction'
import IntegrationAction from './actions/IntegrationAction'

import {getSortedIntegrationActionsNames} from './../../utils'

import css from './MacroEdit.less'

import * as ticketTypes from '../../../../../state/ticket/constants'
import * as newMessageTypes from '../../../../../state/newMessage/constants'
import {ACTION_TEMPLATES} from '../../../../../config'
import {getActionTemplate, humanizeString} from './../../../../../utils'

import * as macroActions from './../../../../../state/macro/actions'

class MacroEdit extends React.Component {
    _updateActionArguments = (index, args = fromJS({})) => {
        const actions = this.props.actions.setIn([index, 'arguments'], args)
        this.props.setActions(actions)
    }

    _updateActionTitle = (index, title) => {
        const actions = this.props.actions.setIn([index, 'title'], title)
        this.props.setActions(actions)
    }

    _addAction = (actionName) => {
        const actions = this.props.actions.push(generateDefaultAction(actionName))
        this.props.setActions(actions)
    }

    _deleteAction = (index) => {
        const actions = this.props.actions.delete(index)
        this.props.setActions(actions)
    }

    _addAttachment = (...args) => {
        return this.props.addAttachments(...args)
            .then(({index, files}) => {
                const actions = this.props.actions.updateIn([index, 'arguments', 'attachments'], attachments => attachments.concat(fromJS(files)))
                this.props.setActions(actions)
            })
    }

    _deleteAttachment = (actionIndex, fileIndex) => {
        const actions = this.props.actions.updateIn([actionIndex, 'arguments', 'attachments'], attachments => attachments.delete(fileIndex))
        this.props.setActions(actions)
    }

    renderNewActionMenu = () => {
        // front actions executed on client
        const ticketActions = ACTION_TEMPLATES
            .filter(template => template.execution === 'front')
            // remove actions that have already been used
            .filter(action => !this.props.actions.find(usedActions => usedActions.get('name') === action.name))

        // external actions executed on server
        const externalActions = ACTION_TEMPLATES.filter(template => template.execution === 'back')
        // external actions without externalType, list of names
        const nonIntegrationActions = externalActions.filter(v => !v.integrationType)

        return (
            <DropdownMenu>
                {ticketActions.length > 0 && <DropdownItem header>Ticket actions</DropdownItem>}
                {
                    ticketActions.map((action) => {
                        const actionName = action.name
                        return (
                            <DropdownItem
                                key={actionName}
                                type="button"
                                onClick={() => this._addAction(actionName)}
                            >
                                {action.title || humanizeString(actionName)}
                            </DropdownItem>
                        )
                    })
                }
                {ticketActions.length > 0 && <DropdownItem divider />}
                <DropdownItem header>External actions</DropdownItem>
                {
                    nonIntegrationActions.map((action) => {
                        const actionName = action.name
                        return (
                            <DropdownItem
                                key={actionName}
                                type="button"
                                onClick={() => this._addAction(actionName)}
                            >
                                {action.title || humanizeString(actionName)}
                            </DropdownItem>
                        )
                    })
                }
            </DropdownMenu>
        )
    }

    render() {
        const {currentMacro} = this.props

        if (!currentMacro) {
            return null
        }

        if (currentMacro.isEmpty()) {
            return null
        }

        // external actions executed on server
        const externalActions = ACTION_TEMPLATES.filter(template => template.execution === 'back')
        // external actions with externalType grouped by externalType
        const integrationMenus = getSortedIntegrationActionsNames(externalActions.filter(v => !!v.integrationType))

        return (
            <form>
                <div className="ui vertical segment">
                    <div>
                        <div className={classnames('mb-2', css.title)}>
                            Macro name
                        </div>
                        <div
                            className="ui content input"
                            style={{width: '100%'}}
                        >
                            <input
                                type="text"
                                onChange={e => this.props.setName(e.target.value)}
                                value={currentMacro.get('name') || ''}
                                required
                            />
                        </div>
                    </div>

                    {
                        this.props.actions.map((action, index) => {
                            let config = {}

                            switch (action.get('name')) {
                                case ticketTypes.SET_STATUS:
                                    config = {
                                        title: 'Set status',
                                        content: (
                                            <SetStatusAction
                                                index={index}
                                                action={action}
                                                updateActionArgs={this._updateActionArguments}
                                            />
                                        ),
                                    }
                                    break
                                case ticketTypes.ADD_TICKET_TAGS:
                                    config = {
                                        title: 'Add tags',
                                        content: (
                                            <AddTagsAction
                                                index={index}
                                                args={action.get('arguments')}
                                                updateActionArgs={this._updateActionArguments}
                                            />
                                        ),
                                    }
                                    break
                                case newMessageTypes.SET_RESPONSE_TEXT:
                                    config = {
                                        title: 'Set response text',
                                        content: (
                                            <SetResponseTextAction
                                                index={index}
                                                action={action}
                                                updateActionArgs={this._updateActionArguments}
                                            />
                                        ),
                                    }
                                    break
                                case ticketTypes.SET_AGENT:
                                    config = {
                                        title: 'Set assignee',
                                        content: (
                                            <SetAssigneeAction
                                                index={index}
                                                action={action}
                                                agents={this.props.agents}
                                                updateActionArgs={this._updateActionArguments}
                                            />
                                        ),
                                    }
                                    break
                                case ticketTypes.SET_SUBJECT:
                                    config = {
                                        title: 'Set ticket subject',
                                        content: (
                                            <SetSubjectAction
                                                index={index}
                                                action={action}
                                                updateActionArgs={this._updateActionArguments}
                                            />
                                        ),
                                    }
                                    break
                                case 'http':
                                    config = {
                                        title: 'Action HTTP',
                                        content: (
                                            <HttpAction
                                                index={index}
                                                action={action}
                                                updateActionArgs={this._updateActionArguments}
                                                updateActionTitle={this._updateActionTitle}
                                            />
                                        ),
                                    }
                                    break
                                case newMessageTypes.ADD_ATTACHMENTS:
                                    config = {
                                        title: 'Add attachments',
                                        content: (
                                            <AddAttachmentsAction
                                                index={index}
                                                action={action}
                                                addAttachments={this._addAttachment}
                                                removeAttachment={this._deleteAttachment}
                                            />
                                        ),
                                    }
                                    break
                                default: {
                                    const integrationType = getActionTemplate(action.get('name')).integrationType
                                    config = {
                                        title: `Action ${integrationType.toUpperCase()}`,
                                        content: (
                                            <IntegrationAction
                                                index={index}
                                                action={action}
                                            />
                                        ),
                                    }
                                }
                            }

                            // the unique key is based on index of action + ID of macro
                            // so when we switch from a macro to the other, all previous macro fields are unmounted
                            // it's simpler to manage lifecycle of actions components then
                            const key = `${index}${currentMacro.get('id')}`

                            return (
                                <div key={key}>
                                    <div className={classnames('ui divider', css.divider)} />
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <div className={css.title}>
                                            {config.title}
                                        </div>
                                        <i
                                            className="fa fa-fw fa-close text-danger clickable"
                                            onClick={() => this._deleteAction(index)}
                                        />
                                    </div>
                                    {config.content}
                                </div>
                            )
                        })
                    }

                    <div className="mt-3">
                        <UncontrolledButtonDropdown
                            className="mr-2"
                        >
                            <DropdownToggle
                                color="info"
                                caret
                                type="button"
                            >
                                Add action
                            </DropdownToggle>
                            {this.renderNewActionMenu()}
                        </UncontrolledButtonDropdown>

                        {
                            integrationMenus.map((actions, key) => {
                                const hasCurrentTypeIntegrations = this.props.integrations.some(
                                    integration => integration.get('type') === key
                                )

                                if (!hasCurrentTypeIntegrations) {
                                    return null
                                }

                                // remove actions that have already been used
                                actions = actions.filter(action => !this.props.actions.find(usedActions => usedActions.get('name') === action))

                                if (actions.isEmpty()) {
                                    return null
                                }

                                return (
                                    <UncontrolledButtonDropdown
                                        key={key}
                                    >
                                        <DropdownToggle
                                            color="secondary"
                                            caret
                                            type="button"
                                        >
                                            Add {humanizeString(key)} action
                                        </DropdownToggle>
                                        <DropdownMenu>
                                            {
                                                actions.map((actionName) => {
                                                    return (
                                                        <DropdownItem
                                                            key={actionName}
                                                            type="button"
                                                            onClick={() => this._addAction(actionName)}
                                                        >
                                                            {getActionTemplate(actionName).title || humanizeString(actionName)}
                                                        </DropdownItem>
                                                    )
                                                })
                                            }
                                        </DropdownMenu>
                                    </UncontrolledButtonDropdown>
                                )
                            }).toList()
                        }
                    </div>
                </div>
            </form>
        )
    }
}

MacroEdit.propTypes = {
    addAttachments: PropTypes.func.isRequired,
    currentMacro: PropTypes.object.isRequired,
    agents: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    integrations: PropTypes.object.isRequired,
    setActions: PropTypes.func.isRequired,
    setName: PropTypes.func.isRequired,
}

function mapStateToProps(state) {
    return {
        integrations: state.integrations.get('integrations', fromJS([])),
    }
}

const mapDispatchToProps = {
    addAttachments: macroActions.addAttachments,
    setName: macroActions.setName,
}

export default connect(mapStateToProps, mapDispatchToProps)(MacroEdit)
