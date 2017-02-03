import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'

import SetPriorityAction from './actions/SetPriorityAction'
import SetStatusAction from './actions/SetStatusAction'
import SetResponseTextAction from './actions/SetResponseTextAction'
import AssignUserAction from './actions/AssignUserAction'
import AddTagsAction from './actions/AddTagsAction'
import HttpAction from './actions/HttpAction'
import AddAttachmentsAction from './actions/AddAttachmentsAction'
import IntegrationAction from './actions/IntegrationAction'
import DefaultAction from './actions/DefaultAction'

import {getSortedIntegrationActionsNames} from './../../utils'

import * as ticketTypes from '../../../../../state/ticket/constants'
import {DEFAULT_ACTIONS, ACTION_TEMPLATES} from '../../../../../config'
import {getActionTemplate} from './../../../../../utils'

import {getMacroSelectedInModal} from './../../../../../state/macro/selectors'

import {humanizeString} from '../../../../common/components/infobar/utils'

class MacroEdit extends React.Component {
    componentDidMount() {
        const insertNewMacro = this.refs.insertNewMacro

        if (insertNewMacro) {
            const $container = insertNewMacro.parentNode

            $(insertNewMacro).dropdown({
                direction: 'bottom',
                onShow: () => {
                    // manually check if there is enough space
                    // to show the dropdown at the bottom.
                    // the direction: 'auto' setting does not work as intended,
                    // for overflow auto containers.
                    const dropdownHeight = 220

                    const containerRect = $container.getBoundingClientRect()
                    const btnRect = insertNewMacro.getBoundingClientRect()

                    const btnTop = btnRect.top - containerRect.top
                    const bottomSpace = containerRect.height - btnRect.height - btnTop

                    // in case we set it at the top previously
                    insertNewMacro.classList.remove('upward')

                    // show it at the top
                    if (bottomSpace < dropdownHeight) {
                        insertNewMacro.classList.add('upward')
                    }
                },
                onHide: () => { $(insertNewMacro).dropdown('clear') }
            })
        }
    }

    create() {
        this.props.actions.createMacro(this.props.currentMacro)
        $('#macro-modal').modal('hide')
    }

    update() {
        this.props.actions.updateMacro(this.props.currentMacro)
        $('#macro-modal').modal('hide')
    }

    deleteMacro() {
        if (confirm(`Do you really want to delete the macro ${this.props.currentMacro.get('name', '')} ?`)) {
            this.props.actions.deleteMacro(this.props.currentMacro.get('id', ''))
        }
    }

    renderNewActionMenu() {
        const externalActions = ACTION_TEMPLATES.filter(template => template.execution === 'back')
        const ticketActions = ACTION_TEMPLATES.filter(template => template.execution === 'front').map(t => t.name)

        const integrationMenus = getSortedIntegrationActionsNames(
            externalActions.filter(v => !!v.integrationType)
        )
        const nonIntegrationActions = externalActions.filter(v => !v.integrationType).map(t => t.name)

        return (
            <div className="menu">
                <div className="header">Ticket Actions</div>
                {
                    ticketActions.map(actionName => (
                        <a
                            key={actionName}
                            onClick={() => this.props.actions.addAction(actionName)}
                            className="item"
                        >
                            {getActionTemplate(actionName).title || humanizeString(actionName)}
                        </a>
                    ))
                }
                <div className="divider"></div>
                <div className="header">External Actions</div>
                {
                    nonIntegrationActions.map(actionName => (
                        <a
                            key={actionName}
                            onClick={() => this.props.actions.addAction(actionName)}
                            className="item"
                        >
                            {getActionTemplate(actionName).title || humanizeString(actionName)}
                        </a>
                    ))
                }
                {
                    integrationMenus.map((actions, key) => {
                        const hasCurrentTypeIntegrations = this.props.integrations.some(
                            integration => integration.get('type') === key
                        )

                        if (!hasCurrentTypeIntegrations) {
                            return null
                        }

                        return (
                            <div className="item">
                                <i className="dropdown icon"/>
                                <span className="text">{humanizeString(key)}</span>
                                <div className="upward menu">
                                    {
                                        actions.map(actionName => (
                                            <a
                                                key={actionName}
                                                onClick={() => this.props.actions.addAction(actionName)}
                                                className="item"
                                            >
                                                {getActionTemplate(actionName).title || humanizeString(actionName)}
                                            </a>
                                        ))
                                    }
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        )
    }

    render() {
        const {loading, currentMacro, actions, cancel, presetActions} = this.props

        if (currentMacro.isEmpty()) {
            return null
        }

        const saveButton = currentMacro.get('id') !== 'new' ? (
            <button type="submit" className="ui green right floated button">Update macro</button>
        ) : (
            <button type="submit" className="ui green right floated button">Create macro</button>
        )

        const submitAction = (e) => {
            e.preventDefault()

            if (currentMacro.get('id') !== 'new') {
                this.update()
            } else {
                this.create()
            }
        }

        const deleteButton = currentMacro.get('id') !== 'new' ? (
            <div className="ui basic red left floated button" onClick={() => this.deleteMacro()}>Delete macro</div>
        ) : null

        return (
            <form className="MacroEdit" onSubmit={submitAction}>
                <div className="ui vertical segment">
                    <div>
                        <h4>MACRO NAME</h4>
                        <div id="macro-name" className="ui content input">
                            <input
                                type="text"
                                onChange={e => actions.setName(e.target.value)}
                                value={currentMacro.get('name') || ''}
                                required
                            />
                        </div>
                        <div className="ui divider"></div>
                    </div>

                    {
                        presetActions.map((action, key) => {
                            // get loading status for the each action of the current macro
                            // `loadingStatus` can be an boolean in most of case but
                            // for files upload, we use a list of boolean
                            const loadingStatus = loading.getIn([currentMacro.get('id'), action.get('name')], false)
                            const isLoading = (loadingStatus && !loadingStatus.isEmpty())
                            switch (action.get('name')) {
                                case ticketTypes.SET_STATUS:
                                    return (
                                        <SetStatusAction
                                            key={key}
                                            index={key}
                                            action={action}
                                            updateActionArgs={actions.updateActionArgs}
                                            deleteAction={actions.deleteAction}
                                        />
                                    )
                                case ticketTypes.ADD_TICKET_TAGS:
                                    return (
                                        <AddTagsAction
                                            key={key}
                                            index={key}
                                            args={action.get('arguments')}
                                            updateActionArgs={actions.updateActionArgs}
                                            deleteAction={actions.deleteAction}
                                        />
                                    )
                                case ticketTypes.SET_RESPONSE_TEXT:
                                    return (
                                        <SetResponseTextAction
                                            key={key}
                                            index={key}
                                            action={action}
                                            updateActionArgs={actions.updateActionArgs}
                                            deleteAction={actions.deleteAction}
                                        />
                                    )
                                case ticketTypes.SET_AGENT:
                                    return (
                                        <AssignUserAction
                                            key={key}
                                            index={key}
                                            action={action}
                                            agents={this.props.agents}
                                            updateActionArgs={actions.updateActionArgs}
                                            deleteAction={actions.deleteAction}
                                        />
                                    )
                                case ticketTypes.TOGGLE_PRIORITY:
                                    return (
                                        <SetPriorityAction
                                            key={key}
                                            index={key}
                                            action={action}
                                            updateActionArgs={actions.updateActionArgs}
                                            deleteAction={actions.deleteAction}
                                        />
                                    )
                                case 'http':
                                    return (
                                        <HttpAction
                                            key={key}
                                            index={key}
                                            action={action}
                                            updateActionArgs={actions.updateActionArgs}
                                            updateActionTitle={actions.updateActionTitle}
                                            deleteAction={actions.deleteAction}
                                        />
                                    )
                                case ticketTypes.ADD_ATTACHMENTS:
                                    return (
                                        <AddAttachmentsAction
                                            key={key}
                                            index={key}
                                            action={action}
                                            isLoading={isLoading}
                                            addAttachments={actions.addAttachments}
                                            removeAttachment={actions.removeAttachment}
                                            deleteAction={actions.deleteAction}
                                        />
                                    )
                                default:
                                    if (getActionTemplate(action.get('name')).integrationType) {
                                        return (
                                            <IntegrationAction
                                                key={key}
                                                index={key}
                                                action={action}
                                                deleteAction={actions.deleteAction}
                                            />
                                        )
                                    }

                                    return (
                                        <DefaultAction
                                            key={key}
                                            index={key}
                                            name={action.get('name')}
                                            deleteAction={actions.deleteAction}
                                        />
                                    )
                            }
                        })
                    }

                    <div
                        className="ui pointing dropdown labeled icon light blue button"
                        ref="insertNewMacro"
                    >
                        <i className="plus icon"/>
                        Insert a new action
                        {this.renderNewActionMenu()}
                    </div>
                </div>

                <div className="buttons-bar">
                    {deleteButton}
                    {saveButton}
                    <div className="ui basic grey right floated button" onClick={cancel}>cancel</div>
                </div>
            </form>
        )
    }
}

MacroEdit.propTypes = {
    loading: PropTypes.object.isRequired,
    currentMacro: PropTypes.object.isRequired,
    agents: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    cancel: PropTypes.func.isRequired,
    presetActions: PropTypes.object.isRequired,

    integrations: PropTypes.object.isRequired
}

function mapStateToProps(state) {
    const currentMacro = getMacroSelectedInModal(state)

    return {
        integrations: state.integrations.get('integrations', fromJS([])),
        currentMacro,
        presetActions: currentMacro.get('actions', fromJS([])).filter(
            action => DEFAULT_ACTIONS.includes(action.get('name'))
        )
    }
}

export default connect(mapStateToProps)(MacroEdit)
