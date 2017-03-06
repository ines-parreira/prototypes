import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import _uniqWith from 'lodash/uniqWith'
import {generateDefaultAction} from '../../../../../state/macro/utils'

import SetPriorityAction from './actions/SetPriorityAction'
import SetStatusAction from './actions/SetStatusAction'
import SetSubjectAction from './actions/SetSubjectAction'
import SetResponseTextAction from './actions/SetResponseTextAction'
import SetAssigneeAction from './actions/SetAssigneeAction'
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
    state = {
        actions: fromJS([]),
    }

    componentWillMount() {
        if (this.props.currentMacro) {
            this._setActions(this.props.currentMacro.get('actions'))
        }
    }

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
                onHide: () => {
                    $(insertNewMacro).dropdown('clear')
                }
            })
        }
    }

    componentWillReceiveProps(nextProps) {
        // if selected macro changes, initialize actions again
        if (nextProps.currentMacro.get('id') !== this.props.currentMacro.get('id')) {
            this._setActions(nextProps.currentMacro.get('actions'))
        }
    }

    _setActions = (actions = fromJS([])) => {
        // filter actions that exist in configuration
        actions = actions.filter(action => DEFAULT_ACTIONS.includes(action.get('name')))

        // keep only one action by type
        actions = fromJS(_uniqWith(actions.toJS(), (first, second) => first.name === second.name))

        this.setState({actions})
    }

    _updateActionArguments = (index, args = fromJS({})) => {
        const actions = this.state.actions.setIn([index, 'arguments'], args)
        this.setState({actions})
    }

    _updateActionTitle = (index, title) => {
        const actions = this.state.actions.setIn([index, 'title'], title)
        this.setState({actions})
    }

    _addAction = (actionName) => {
        if (!~DEFAULT_ACTIONS.indexOf(actionName)) {
            return
        }

        const actions = this.state.actions.push(generateDefaultAction(actionName))
        this.setState({actions})
    }

    _deleteAction = (index) => {
        const actions = this.state.actions.delete(index)
        this.setState({actions})
    }

    _addAttachment = (...args) => {
        return this.props.actions.addAttachments(...args)
            .then(({index, files}) => {
                const actions = this.state.actions.updateIn([index, 'arguments', 'attachments'], attachments => attachments.concat(fromJS(files)))
                this.setState({actions})
            })
    }

    _deleteAttachment = (actionIndex, fileIndex) => {
        const actions = this.state.actions.updateIn([actionIndex, 'arguments', 'attachments'], attachments => attachments.delete(fileIndex))
        this.setState({actions})
    }

    create = () => {
        this.props.actions.createMacro(this.props.currentMacro.set('actions', this.state.actions))
        $('#macro-modal').modal('hide')
    }

    update = () => {
        this.props.actions.updateMacro(this.props.currentMacro.set('actions', this.state.actions))
        $('#macro-modal').modal('hide')
    }

    deleteMacro = () => {
        if (confirm(`Do you really want to delete the macro ${this.props.currentMacro.get('name', '')} ?`)) {
            this.props.actions.deleteMacro(this.props.currentMacro.get('id', ''))
        }
    }

    renderNewActionMenu = () => {
        // front actions executed on client
        const ticketActions = ACTION_TEMPLATES
            .filter(template => template.execution === 'front')
            // remove actions that have already been used
            .filter(action => !this.state.actions.find(usedActions => usedActions.get('name') === action.name))

        // external actions executed on server
        const externalActions = ACTION_TEMPLATES.filter(template => template.execution === 'back')
        // external actions with externalType grouped by externalType
        const integrationMenus = getSortedIntegrationActionsNames(externalActions.filter(v => !!v.integrationType))
        // external actions without externalType, list of names
        const nonIntegrationActions = externalActions.filter(v => !v.integrationType)

        return (
            <div className="menu">
                {ticketActions.length > 0 && <div className="header">Ticket Actions</div>}
                {
                    ticketActions.map((action) => {
                        const actionName = action.name
                        return (
                            <a
                                key={actionName}
                                onClick={() => this._addAction(actionName)}
                                className="item"
                            >
                                {action.title || humanizeString(actionName)}
                            </a>
                        )
                    })
                }
                {ticketActions.length > 0 && <div className="divider"></div>}
                <div className="header">External Actions</div>
                {
                    nonIntegrationActions.map((action) => {
                        const actionName = action.name
                        return (
                            <a
                                key={actionName}
                                onClick={() => this._addAction(actionName)}
                                className="item"
                            >
                                {action.title || humanizeString(actionName)}
                            </a>
                        )
                    })
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
                            <div
                                className="item"
                                key={key}
                            >
                                <i className="dropdown icon" />
                                <span className="text">{humanizeString(key)}</span>
                                <div className="upward menu">
                                    {
                                        actions.map(actionName => (
                                            <a
                                                key={actionName}
                                                onClick={() => this._addAction(actionName)}
                                                className="item"
                                            >
                                                {getActionTemplate(actionName).title || humanizeString(actionName)}
                                            </a>
                                        ))
                                    }
                                </div>
                            </div>
                        )
                    }).toList()
                }
            </div>
        )
    }

    render() {
        const {currentMacro, actions, cancel} = this.props

        if (currentMacro.isEmpty()) {
            return null
        }

        const isUpdate = currentMacro.get('id') !== 'new'

        return (
            <form className="MacroEdit">
                <div className="ui vertical segment">
                    <div>
                        <h4>MACRO NAME</h4>
                        <div
                            className="ui content input"
                            style={{width: '100%'}}
                        >
                            <input
                                type="text"
                                onChange={e => actions.setName(e.target.value)}
                                value={currentMacro.get('name') || ''}
                                required
                            />
                        </div>
                    </div>

                    {
                        this.state.actions.map((action, index) => {
                            let child = null

                            switch (action.get('name')) {
                                case ticketTypes.SET_STATUS:
                                    child = (
                                        <SetStatusAction
                                            index={index}
                                            action={action}
                                            updateActionArgs={this._updateActionArguments}
                                            deleteAction={this._deleteAction}
                                        />
                                    )
                                    break
                                case ticketTypes.ADD_TICKET_TAGS:
                                    child = (
                                        <AddTagsAction
                                            index={index}
                                            args={action.get('arguments')}
                                            updateActionArgs={this._updateActionArguments}
                                            deleteAction={this._deleteAction}
                                        />
                                    )
                                    break
                                case ticketTypes.SET_RESPONSE_TEXT:
                                    child = (
                                        <SetResponseTextAction
                                            index={index}
                                            action={action}
                                            updateActionArgs={this._updateActionArguments}
                                            deleteAction={this._deleteAction}
                                        />
                                    )
                                    break
                                case ticketTypes.SET_AGENT:
                                    child = (
                                        <SetAssigneeAction
                                            index={index}
                                            action={action}
                                            agents={this.props.agents}
                                            updateActionArgs={this._updateActionArguments}
                                            deleteAction={this._deleteAction}
                                        />
                                    )
                                    break
                                case ticketTypes.SET_SUBJECT:
                                    child = (
                                        <SetSubjectAction
                                            index={index}
                                            action={action}
                                            updateActionArgs={this._updateActionArguments}
                                            deleteAction={this._deleteAction}
                                        />
                                    )
                                    break
                                case ticketTypes.TOGGLE_PRIORITY:
                                    child = (
                                        <SetPriorityAction
                                            index={index}
                                            action={action}
                                            updateActionArgs={this._updateActionArguments}
                                            deleteAction={this._deleteAction}
                                        />
                                    )
                                    break
                                case 'http':
                                    child = (
                                        <HttpAction
                                            index={index}
                                            action={action}
                                            updateActionArgs={this._updateActionArguments}
                                            updateActionTitle={this._updateActionTitle}
                                            deleteAction={this._deleteAction}
                                        />
                                    )
                                    break
                                case ticketTypes.ADD_ATTACHMENTS:
                                    child = (
                                        <AddAttachmentsAction
                                            index={index}
                                            action={action}
                                            addAttachments={this._addAttachment}
                                            removeAttachment={this._deleteAttachment}
                                            deleteAction={this._deleteAction}
                                        />
                                    )
                                    break
                                default:
                                    if (getActionTemplate(action.get('name')).integrationType) {
                                        child = (
                                            <IntegrationAction
                                                index={index}
                                                action={action}
                                                deleteAction={this._deleteAction}
                                            />
                                        )
                                    } else {
                                        child = (
                                            <DefaultAction
                                                index={index}
                                                name={action.get('name')}
                                                deleteAction={this._deleteAction}
                                            />
                                        )
                                    }
                            }

                            // the unique key is based on index of action + ID of macro
                            // so when we switch from a macro to the other, all previous macro fields are unmounted
                            // it's simpler to manage lifecycle of actions components then
                            const key = `${index}${currentMacro.get('id')}`

                            return (
                                <div key={key}>
                                    <div className="ui divider" />
                                    {child}
                                </div>
                            )
                        })
                    }

                    <div
                        className="ui pointing dropdown labeled icon light blue button mt20i"
                        ref="insertNewMacro"
                    >
                        <i className="plus icon" />
                        Insert a new action
                        {this.renderNewActionMenu()}
                    </div>
                </div>

                <div className="buttons-bar">
                    {
                        isUpdate && (
                            <div
                                className="ui basic red left floated button"
                                onClick={this.deleteMacro}
                            >
                                Delete macro
                            </div>
                        )
                    }
                    {
                        isUpdate ? (
                                <button
                                    type="button"
                                    className="ui green right floated button"
                                    onClick={this.update}
                                >
                                    Update macro
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="ui green right floated button"
                                    onClick={this.create}
                                >
                                    Create macro
                                </button>
                            )
                    }
                    <div
                        className="ui basic grey right floated button"
                        onClick={cancel}
                    >
                        Cancel
                    </div>
                </div>
            </form>
        )
    }
}

MacroEdit.propTypes = {
    currentMacro: PropTypes.object.isRequired,
    agents: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    cancel: PropTypes.func.isRequired,
    integrations: PropTypes.object.isRequired
}

function mapStateToProps(state) {
    const currentMacro = getMacroSelectedInModal(state)

    return {
        integrations: state.integrations.get('integrations', fromJS([])),
        currentMacro,
    }
}

export default connect(mapStateToProps)(MacroEdit)
