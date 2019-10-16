import React, {Fragment} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import {UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap'

import {generateDefaultAction} from '../../../../../state/macro/utils'

import * as ticketTypes from '../../../../../state/ticket/constants'
import * as newMessageTypes from '../../../../../state/newMessage/constants'
import * as integrationsSelectors from '../../../../../state/integrations/selectors'
import {ACTION_TEMPLATES} from '../../../../../config'
import InputField from '../../../../common/forms/InputField'

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


import {getActionTemplate, humanizeString} from './../../../../../utils'


export class MacroEdit extends React.Component {
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

    _addAttachment = (index, files) => {
        const actions = this.props.actions.updateIn([index, 'arguments', 'attachments'], (attachments) => attachments.concat(fromJS(files)))
        this.props.setActions(actions)
    }

    _deleteAttachment = (actionIndex, fileIndex) => {
        const actions = this.props.actions.updateIn([actionIndex, 'arguments', 'attachments'], (attachments) => attachments.delete(fileIndex))
        this.props.setActions(actions)
    }

    renderNewActionMenu = () => {
        // front actions executed on client
        const ticketActions = ACTION_TEMPLATES
            .filter((template) => template.execution === 'front')
            // remove actions that have already been used
            .filter((action) => !this.props.actions.find((usedActions) => usedActions.get('name') === action.name))

        // external actions executed on server
        const externalActions = ACTION_TEMPLATES.filter((template) => template.execution === 'back')
        // external actions without externalType, list of names
        const nonIntegrationActions = externalActions.filter((v) => !v.integrationType)

        const hasActions = (ticketActions.length  > 0)

        return (
            <DropdownMenu className={css.dropdown}>
                {hasActions && <DropdownItem header>TICKET ACTIONS</DropdownItem>}
                {hasActions && <DropdownItem divider />}
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
                {hasActions && <DropdownItem divider />}
                <DropdownItem header>EXTERNAL ACTIONS</DropdownItem>
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

    renderIntentMenu = () => {
        let intents = fromJS(window.GORGIAS_CONSTANTS.INTENTS)
        intents = intents.reduce((newIntents, intentDesc, intentName) => {
            return newIntents.setIn(intentName.split('/'), intentDesc)
        }, fromJS({}))

        return (
            <DropdownMenu className={css.dropdown}>
                <DropdownItem
                    type="button"
                    onClick={() => this.props.setIntent(null)}>
                    <i className="icon material-icons">
                        clear
                    </i>
                    { humanizeString('clear intent') }
                </DropdownItem>
                {
                    intents.entrySeq().sort().map(([category, subIntents]) => {
                        return (
                            <Fragment key={category}>
                                <DropdownItem divider/>
                                <DropdownItem header>{category.toUpperCase()}</DropdownItem>
                                {
                                    subIntents.entrySeq().sort().map(([intentName, intentDescription]) => {
                                        const intentValue = `${category}/${intentName}`
                                        return (
                                            <DropdownItem
                                                key={intentName}
                                                type="button"
                                                onClick={() => this.props.setIntent(intentValue)}
                                            >
                                                {humanizeString(intentName)}
                                                <br/>
                                                <span className={css.intentDescription}>
                                                    {intentDescription}
                                                </span>
                                            </DropdownItem>
                                        )
                                    })
                                }
                            </Fragment>
                        )
                    })
                }
            </DropdownMenu>
        )
    }

    render() {
        const {currentMacro, hasIntegrationOfTypes} = this.props

        if (!currentMacro) {
            return null
        }

        if (currentMacro.isEmpty()) {
            return null
        }

        // external actions executed on server
        const externalActions = ACTION_TEMPLATES.filter((template) => template.execution === 'back')
        // external actions with externalType grouped by externalType
        const integrationMenus = getSortedIntegrationActionsNames(externalActions.filter((v) => !!v.integrationType))

        return (
            <form>
                <div className="mt-3 mb-3">
                    <div>
                        <div className={classnames('mb-2', css.title)}>
                            Macro name
                        </div>
                        <InputField
                            type="text"
                            name="name"
                            onChange={this.props.setName}
                            value={this.props.name}
                            required
                        />
                    </div>

                    <div>
                        <div className={classnames('mb-2', css.title)}>
                            Intent
                        </div>
                        <div className={css.description}>
                            Choose an intent to describe in which cases this macro will be used.
                        </div>
                        <UncontrolledButtonDropdown>
                            <DropdownToggle caret>
                                {(this.props.intent && humanizeString(this.props.intent.replace('/', ' - '))) ||
                                'Choose intent'}
                            </DropdownToggle>
                            {this.renderIntentMenu()}
                        </UncontrolledButtonDropdown>
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
                                        title: 'Set user assignee',
                                        content: (
                                            <SetAssigneeAction
                                                index={index}
                                                action={action}
                                                agents={this.props.agents}
                                                updateActionArgs={this._updateActionArguments}
                                                handleUsers={true}
                                            />
                                        ),
                                    }
                                    break
                                case ticketTypes.SET_TEAM:
                                    config = {
                                        title: 'Set team assignee',
                                        content: (
                                            <SetAssigneeAction
                                                index={index}
                                                action={action}
                                                agents={this.props.agents}
                                                updateActionArgs={this._updateActionArguments}
                                                handleTeams={true}
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
                                        title: 'HTTP WebHook',
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
                                <div
                                    key={key}
                                    className="mt-3"
                                >
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <div className={css.title}>
                                            {config.title}
                                        </div>
                                        <i
                                            className="material-icons md-2 clickable"
                                            onClick={() => this._deleteAction(index)}
                                        >
                                            close
                                        </i>
                                    </div>
                                    {config.content}
                                </div>
                            )
                        })
                    }

                    <div className="mt-3">
                        <UncontrolledButtonDropdown className="mr-2">
                            <DropdownToggle
                                color="primary"
                                caret
                                type="button"
                            >
                                Add action
                            </DropdownToggle>
                            {this.renderNewActionMenu()}
                        </UncontrolledButtonDropdown>

                        {
                            integrationMenus.map((actions, key) => {
                                if (!hasIntegrationOfTypes(key)) {
                                    return null
                                }

                                // remove actions that have already been used
                                actions = actions.filter((action) => !this.props.actions.find((usedActions) => usedActions.get('name') === action))

                                if (actions.isEmpty()) {
                                    return null
                                }

                                return (
                                    <UncontrolledButtonDropdown
                                        key={key}
                                        className="mr-2"
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
    currentMacro: PropTypes.object.isRequired,
    agents: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    actions: PropTypes.object.isRequired,
    setActions: PropTypes.func.isRequired,
    setName: PropTypes.func.isRequired,
    hasIntegrationOfTypes: PropTypes.func.isRequired,
    intent: PropTypes.string,
    setIntent: PropTypes.func.isRequired
}

function mapStateToProps(state) {
    return {
        hasIntegrationOfTypes: integrationsSelectors.makeHasIntegrationOfTypes(state),
    }
}

export default connect(mapStateToProps)(MacroEdit)
