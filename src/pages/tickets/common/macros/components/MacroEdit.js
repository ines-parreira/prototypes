import React, {PropTypes} from 'react'

import SetPriorityAction from './actions/SetPriorityAction'
import SetStatusAction from './actions/SetStatusAction'
import SetResponseTextAction from './actions/SetResponseTextAction'
import AssignUserAction from './actions/AssignUserAction'
import AddTagsAction from './actions/AddTagsAction'
import HttpAction from './actions/HttpAction'

import * as ticketTypes from '../../../../../state/ticket/constants'
import {DEFAULT_ACTIONS} from '../../../../../config'

export default class MacroEdit extends React.Component {
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
                onChange: (value, text) => {
                    if (~DEFAULT_ACTIONS.indexOf(text)) {
                        this.props.actions.addAction(text)
                        $('#new-action-popup').dropdown('set text', 'Insert a new action')
                    }
                }
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
        if (confirm(`Do you really want to delete the macro ${this.props.currentMacro.get('name')} ?`)) {
            this.props.actions.deleteMacro(this.props.currentMacro.get('id'))
        }
    }

    render() {
        const {currentMacro, actions, cancel} = this.props

        if (!currentMacro) {
            return null
        }

        const presetActions = currentMacro.get('actions').filter(
            action => ~DEFAULT_ACTIONS.indexOf(action.get('name'))
        )

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
                                            action={action}
                                            tags={this.props.tags}
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

                                default:
                                    return null
                            }
                        })
                    }

                    <div className="ui floating dropdown labeled search icon light blue button"
                         ref="insertNewMacro"
                    >
                        <i className="plus icon" />
                        <span className="text">Insert a new action</span>
                        <div className="menu">
                            {
                                DEFAULT_ACTIONS.map(action => (
                                    <a key={action} className="item">{action}</a>
                                ))
                            }
                        </div>
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
    currentMacro: PropTypes.object,
    tags: PropTypes.object.isRequired,
    agents: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    cancel: PropTypes.func.isRequired
}
