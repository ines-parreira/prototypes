import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import {ACTION_TEMPLATES} from './../../constants'
import classnames from 'classnames'
import { getModifier } from './../../utils'

export default class MacroPreview extends React.Component {
    renderSetStatus(setStatusAction) {
        if (setStatusAction) {
            return (
                <div className="macro-data">
                    <div className="ui label macro-legend">SET STATUS:</div>
                    <div className={`ui label ticket-status ${setStatusAction.getIn(['arguments', 'status'])}`}>
                        {setStatusAction.getIn(['arguments', 'status'])}
                    </div>
                </div>
            )
        }
        return null
    }

    renderAddTags(addTagsActions) {
        if (!addTagsActions || !addTagsActions.size) {
            return null
        }

        return (
            <div className="macro-data">
                <div className="ui label macro-legend">ADD TAGS:</div>
                {
                    addTagsActions.map((action) =>
                        action.get('arguments').map((arg, i) =>
                            <div key={`action-tag-${action.id}-${i}`} className="ui label ticket-tag no-icon">
                                {arg.get('name')}
                            </div>
                        )
                    )
                }
            </div>
        )
    }

    renderAssignUser(assignUserAction) {
        if (!assignUserAction) {
            return null
        }

        return (
            <div className="macro-data">
                <div className="ui label macro-legend">ASSIGN TO:</div>
                <span
                    key={`action-assign-${assignUserAction.id}`}
                    className="ticket-owner-btn ticket-details-item"
                >
                    <span className="agent-label ui medium yellow label">A</span>
                    <span className="secondary-action">
                        {assignUserAction.getIn(['arguments', 'assignee_user', 'name']).toUpperCase()}
                    </span>
                </span>
            </div>
        )
    }

    renderSetPriority(setPriorityAction) {
        if (!setPriorityAction) {
            return null
        }

        return (
            <div className="macro-data">
                <div className="ui label macro-legend">SET PRIORITY:</div>
                <a className="ticket-flag-btn ticket-details-item">
                    <i
                        className={classnames(
                            'ticket-priority',
                            setPriorityAction.getIn(['arguments', 'priority']) === 'high' ? '' : 'outline',
                            'icon',
                            'flag'
                        )}
                    />
                </a>
            </div>
        )
    }

    renderExternalActions(externalActions) {
        if (!externalActions || !externalActions.size) {
            return null
        }

        return (
            <div className="macro-data">
                <div className="ui label macro-legend">ACTIONS:</div>
                {
                    externalActions.map((action, idx) =>
                        <div key={`external-action-${idx}`} className="ui yellow label">{action.get('title')}</div>
                    )
                }
            </div>
        )
    }

    componentDidMount() {
        const settings = {
            position: 'top center',
            variation: 'tiny inverted',
            delay: 200
        }

        $('#applyToGroup').popup(settings)
        $('#cancel').popup(settings)
    }

    render() {
        const {currentMacro, apply, cancel, selected} = this.props

        if (!currentMacro) {
            return null
        }

        const addTagsActions = currentMacro.get('actions').filter(action => action.get('name') === 'addTags')
        const responseTextAction = currentMacro.get('actions').find(action => action.get('name') === 'setResponseText')
        const setStatusAction = currentMacro.get('actions').find(action => action.get('name') === 'setStatus')
        const setPriorityAction = currentMacro.get('actions').find(action => action.get('name') === 'setPriority')
        const assignUserAction = currentMacro.get('actions').find(action => action.get('name') === 'assignUser')
        const externalActions = currentMacro.get('actions').filter(
            action => fromJS(ACTION_TEMPLATES).getIn([action.get('name'), 'execution']) === 'back'
        )

        return (
            <div className="MacroPreview">
                <div className="ui vertical segment">
                    <div><h4>{currentMacro.get('name') || ''}</h4></div>

                    {this.renderSetStatus(setStatusAction)}
                    {this.renderAddTags(addTagsActions)}
                    {this.renderAssignUser(assignUserAction)}
                    {this.renderSetPriority(setPriorityAction)}
                    {this.renderExternalActions(externalActions)}
                    <div className="macro-data pre">{responseTextAction.getIn(['arguments', 'body_text'])}</div>
                </div>
                <div className="buttons-bar">
                    <div
                        id="applyToGroup"
                        className="ui green right floated button"
                        onClick={apply}
                        data-content={`${getModifier()} + Enter`}
                    >
                        Apply macro to {selected.size} tickets
                    </div>
                    <div id="cancel" className="ui basic grey right floated button" onClick={cancel} data-content="Esc">cancel</div>
                </div>
            </div>
        )
    }
}

MacroPreview.propTypes = {
    currentMacro: PropTypes.object,
    apply: PropTypes.func.isRequired,
    cancel: PropTypes.func.isRequired,
    selected: PropTypes.object.isRequired
}
