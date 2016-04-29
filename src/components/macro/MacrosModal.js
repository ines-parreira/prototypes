import React, {PropTypes} from 'react'
import Immutable from 'immutable'
import SearchInput from 'react-search-input'

import TicketTags from './../ticket/ticketview/ticketdetails/TicketTags'
import TicketPriority from './../ticket/ticketview/ticketdetails/TicketPriority'
import TicketAssignee from './../ticket/ticketview/ticketdetails/TicketAssignee'
import TicketStatus from './../ticket/ticketview/ticketdetails/TicketStatus'
import { DEFAULT_ACTIONS } from './../../constants'
import * as ticketActions from './../../actions/ticket'

export default class MacrosModal extends React.Component {
    constructor() {
        super()
        this.state = {searchTerm: ''}
    }

    searchUpdated = (term) => {
        this.setState({searchTerm: term}) // Necessary for re-render
    }

    componentDidMount() {
        $('#macro-modal').modal({
            onHidden: this.props.actions.closeModal
        }).modal('show')

        $('#new-action-popup').popup({
            inline: true,
            hoverable: true
        })
    }

    componentWillUnmount() {
        $('#macro-modal').modal('hide')
    }

    renderSetResponseTextAction(action, key) {
        return (
            <div key={key} className="response-text">
                <i
                    className="right floated remove circle red large action icon"
                    onClick={() => this.props.actions.deleteAction(action.get('id'))}
                />
                <h4>ADD RESPONSE TEXT</h4>
                <div className="ui form">
                    <div className="field">
                        <textarea
                            onChange={e => this.props.actions.setResponseText(e.target.value)}
                            value={action.getIn(['arguments', 'body_html'])}
                        />
                    </div>
                </div>
                <div className="ui divider"></div>
            </div>
        )
    }

    renderSetStatusAction(action, key) {
        return (
            <div key={key} className="status">
                <i
                    className="right floated remove circle red large action icon"
                    onClick={() => this.props.actions.deleteAction(action.get('id'))}
                />
                <h4>SET STATUS</h4>
                <TicketStatus
                    currentStatus={action.getIn(['arguments', 'status'])}
                    setStatus={this.props.actions.setStatus}
                    suffix="macro-modal"
                    position="bottom left"
                />
                <div className="ui divider"></div>
            </div>
        )
    }

    renderAddTagsAction(action, key) {
        return (
            <div key={key} className="tags">
                <i
                    className="right floated remove circle red large action icon"
                    onClick={() => this.props.actions.deleteAction(action.get('id'))}
                />
                <h4>ADD TAGS</h4>
                <TicketTags
                    tags={this.props.tags.toJS()}
                    ticketTags={action.get('arguments')}
                    addTag={this.props.actions.addTags}
                    removeTag={this.props.actions.deleteTag}
                    suffix="macro-modal"
                />
                <div className="ui divider"></div>
            </div>
        )
    }

    renderSetAgentAction(action, key) {
        return (
            <div key={key} className="assignee">
                <i
                    className="right floated remove circle red large action icon"
                    onClick={() => this.props.actions.deleteAction(action.get('id'))}
                />
                <h4>SET ASSIGNEE</h4>
                <TicketAssignee
                    currentAssignee={action.getIn(['arguments', 'assignee_user', 'name'])}
                    agents={this.props.agents}
                    setAgent={this.props.actions.setAssignee}
                    suffix="macro-modal"
                />
                <div className="ui divider"></div>
            </div>
        )
    }

    renderSetPriorityAction(action, key) {
        return (
            <div key={key} className="priority">
                <i
                    className="right floated remove circle red large action icon"
                    onClick={() => this.props.actions.deleteAction(action.get('id'))}
                />
                <h4>SET PRIORITY</h4>
                <TicketPriority
                    priority={action.getIn(['arguments', 'priority'])}
                    togglePriority={this.props.actions.togglePriority}
                />
                <div className="ui divider"></div>
            </div>
        )
    }

    renderExternalActions(actions) {
        if (actions.size) {
            return (
                <div>
                    <h4>EXTERNAL ACTIONS</h4>
                    {
                        actions.map(action => (
                          <button key={action.get('id')} className="ui right labeled icon yellow button">
                              {action.get('title')}

                            <i
                                className="close icon"
                                onClick={() => this.props.actions.deleteAction(action.get('id'))}
                            />
                          </button>
                        ))
                    }
                    <div className="ui divider"></div>
                </div>
            )
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

    cancel() {
        $('#macro-modal').modal('hide')
    }

    deleteMacro() {
        if (confirm(`Do you really want to delete the macro ${this.props.currentMacro.get('name')} ?`)) {
            this.props.actions.deleteMacro(this.props.currentMacro.get('id'))
        }
    }

    render() {
        const { macros, currentMacro, actions } = this.props

        const presetActions = currentMacro.get('actions').filter(
            action => DEFAULT_ACTIONS.indexOf(action.get('name')) !== -1
        )
        const externalActions = currentMacro.get('actions').filter(
            action => DEFAULT_ACTIONS.indexOf(action.get('name')) === -1
        )

        const saveButton = currentMacro.get('id') !== 'new' ? (
            <div className="ui green right floated button" onClick={() => this.update()}>Update macro</div>
        ) : (
            <div className="ui green right floated button" onClick={() => this.create()}>Create macro</div>
        )

        const deleteButton = currentMacro.get('id') !== 'new' ? (
            <div className="ui basic red left floated button" onClick={() => this.deleteMacro()}>Delete macro</div>
        ) : null

        /** Used to replace the list of all macros with the list of macros corresponding to the current search term,
         *  if there is a current search term.
         */
        const curMacros = this.refs.search ? Immutable.fromJS(macros.valueSeq().toJS().filter(this.refs.search.filter(['name']))) : macros

        return (
            <div id="macro-modal" className="MacroModal ui large modal">
                <i className="close icon"/>
                <div className="header">
                    Manage macros
                </div>
                <div className="ui grid container">
                    <div className="five wide left column">
                        <div className="ui secondary vertical fluid menu">
                            <div className="ui category search item">
                                <div className="ui icon input">
                                    <SearchInput
                                        ref="search"
                                        onChange={this.searchUpdated}
                                        className="ui icon input full-width prompt"
                                        placeholder="Search for a macro"
                                    />
                                  <i className="search icon"/>
                                </div>
                            </div>
                            {
                                curMacros.map(macro => (
                                    <a
                                        className={`item ${macro.get('id') === currentMacro.get('id') ? 'active' : ''}`}
                                        key={macro.get('id')}
                                        onClick={() => {actions.previewMacroInModal(macro.get('id'))}}
                                    >
                                        {macro.get('name')}
                                    </a>
                                ))
                            }
                        </div>
                        <div className="button-wrapper">
                            <div className="ui basic light blue fluid button" onClick={actions.addNewMacro}>Create macro</div>
                        </div>
                    </div>
                    <div className="eleven wide right column">
                        <div className="ui vertical segment">
                            <div>
                                <h4>MACRO NAME</h4>
                                <div id="macro-name" className="ui content input">
                                    <input
                                        type="text"
                                        onChange={e => actions.setName(e.target.value)}
                                        value={currentMacro.get('name') || ''}
                                    />
                                </div>
                                <div className="ui divider"></div>
                            </div>

                            {
                                presetActions.map((action, key) => {
                                    switch (action.get('name')) {
                                        case ticketActions.SET_STATUS:
                                            return this.renderSetStatusAction(action, key)
                                        case ticketActions.ADD_TICKET_TAGS:
                                            return this.renderAddTagsAction(action, key)
                                        case ticketActions.SET_RESPONSE_TEXT:
                                            return this.renderSetResponseTextAction(action, key)
                                        case ticketActions.SET_AGENT:
                                            return this.renderSetAgentAction(action, key)
                                        case ticketActions.TOGGLE_PRIORITY:
                                            return this.renderSetPriorityAction(action, key)
                                        default:
                                            return null
                                    }
                                })
                            }

                            {this.renderExternalActions(externalActions)}


                            <button id="new-action-popup" className="ui light blue button">
                                Insert new action
                            </button>

                            <div className="ui popup">
                                <div className="ui vertical menu">
                                {
                                    DEFAULT_ACTIONS.map(action => (
                                        <a key={action} className="item" onClick={() => actions.addAction(action)}>{action}</a>
                                    ))
                                }
                                </div>
                            </div>
                        </div>

                        <div className="buttons-bar">
                            {deleteButton}
                            {saveButton}
                            <div className="ui basic grey right floated button" onClick={() => this.cancel()}>cancel</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

MacrosModal.propTypes = {
    macros: PropTypes.object.isRequired,
    currentMacro: PropTypes.object.isRequired,
    tags: PropTypes.object.isRequired,
    agents: PropTypes.object.isRequired,

    actions: PropTypes.object.isRequired
}
