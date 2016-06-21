import React, {PropTypes} from 'react'

import SetPriorityAction from './actions/SetPriorityAction'
import SetStatusAction from './actions/SetStatusAction'
import SetResponseTextAction from './actions/SetResponseTextAction'
import AssignUserAction from './actions/AssignUserAction'
import AddTagsAction from './actions/AddTagsAction'
import HttpAction from './actions/HttpAction'

import * as ticketActions from './../../actions/ticket'
import { DEFAULT_ACTIONS } from './../../constants'

export default class MacroEdit extends React.Component {
    componentDidMount() {
        $('#new-action-popup').dropdown({
            direction: 'upward',
            onChange: (value, text) => {
                if (DEFAULT_ACTIONS.indexOf(text) !== -1) {
                    this.props.actions.addAction(text)
                    $('#new-action-popup').dropdown('set text', 'Insert a new action')
                }
            }
        })
    }

    update() {
        this.props.actions.updateMacro(this.props.currentMacro)
        $('#macro-modal').modal('hide')
    }

    render() {
        const {currentMacro, actions, cancel} = this.props

        if (!currentMacro) {
            return null
        }

        const presetActions = currentMacro.get('actions').filter(
            action => DEFAULT_ACTIONS.indexOf(action.get('name')) !== -1
        )

        const saveButton = currentMacro.get('id') !== 'new' ? (
            <div className="ui green right floated button" onClick={() => this.update()}>Update macro</div>
        ) : (
            <div className="ui green right floated button" onClick={() => this.create()}>Create macro</div>
        )

        const deleteButton = currentMacro.get('id') !== 'new' ? (
            <div className="ui basic red left floated button" onClick={() => this.deleteMacro()}>Delete macro</div>
        ) : null

        return (
            <div className="MacroEdit">
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
                                    return (
                                        <SetStatusAction
                                            key={key}
                                            index={key}
                                            action={action}
                                            updateActionArgs={actions.updateActionArgs}
                                            deleteAction={actions.deleteAction}
                                        />
                                    )
                                case ticketActions.ADD_TICKET_TAGS:
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
                                case ticketActions.SET_RESPONSE_TEXT:
                                    return (
                                        <SetResponseTextAction
                                            key={key}
                                            index={key}
                                            action={action}
                                            updateActionArgs={actions.updateActionArgs}
                                            deleteAction={actions.deleteAction}
                                        />
                                    )
                                case ticketActions.SET_AGENT:
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
                                case ticketActions.TOGGLE_PRIORITY:
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

                    <div id="new-action-popup" className="ui floating dropdown labeled search icon light blue button">
                        <i className="plus icon"/>
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
            </div>
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
