import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import {ACTION_TEMPLATES} from './../../../../constants'


export default class TicketMacros extends React.Component {
    renderMacroListItem = (macro) => {
        const containerOpts = {
            key: macro.get('id'),
            className: classnames('item macro-item', {active: macro.get('id') === this.props.selected.get('id')}),
            onMouseEnter: () => this.props.previewMacro(macro),
            onClick: () => this.props.applyMacro(macro),
        }

        return (
            <div {...containerOpts}>
                <div className="content">
                    <div className="">{macro.get('name')}</div>
                </div>
            </div>
        )
    }

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
                            <div key={`action-tag-${action.id}-${i}`}
                                 className="ui label ticket-tag no-icon">{arg.get('name')}</div>
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

    openModalOnSelectedMacro(selectedMacroId) {
        this.props.previewMacroInModal(selectedMacroId)
        this.props.openModal()
    }

    renderSelectedMacro = () => {
        const macro = this.props.selected

        if (!macro || macro.isEmpty()) {
            return null
        }

        const addTagsActions = macro.get('actions').filter(action => action.get('name') === 'addTags')
        const responseTextAction = macro.get('actions').find(action => action.get('name') === 'setResponseText')
        const setStatusAction = macro.get('actions').find(action => action.get('name') === 'setStatus')
        const setPriorityAction = macro.get('actions').find(action => action.get('name') === 'setPriority')
        const assignUserAction = macro.get('actions').find(action => action.get('name') === 'assignUser')
        const externalActions = macro.get('actions').filter(
            action => fromJS(ACTION_TEMPLATES).getIn([action.get('name'), 'execution']) === 'back'
        )

        let textPreview = null
        if (responseTextAction) {
            const html = responseTextAction.getIn(['arguments', 'body_html'])
            const text = responseTextAction.getIn(['arguments', 'body_text'])
            if (text) {
                textPreview = (<pre className="text-preview">{text}</pre>)
            } else {
                textPreview = (<div className="text-preview" dangerouslySetInnerHTML={{__html: html}}/>)
            }
        }

        return (
            <div className="macro-preview">
                <div>
                    <a className="ui right floated basic label"
                       onClick={() => this.openModalOnSelectedMacro(macro.get('id'))}>
                        MANAGE MACROS
                    </a>
                    {this.renderSetStatus(setStatusAction)}
                    {this.renderAddTags(addTagsActions)}
                    {this.renderAssignUser(assignUserAction)}
                    {this.renderSetPriority(setPriorityAction)}
                    {this.renderExternalActions(externalActions)}
                    {textPreview}
                </div>
            </div>
        )
    }

    render() {
        let content = (
            <div className="ui grid">
                <div className="macro-list four wide column">
                    <div className="ui aligned selection relaxed list">
                        {this.props.items.map(this.renderMacroListItem)}
                    </div>
                </div>
                <div className="macro-preview-container twelve wide column">
                    <div className="macro-detail">
                        {this.renderSelectedMacro()}
                    </div>
                </div>
            </div>
        )

        if (!this.props.items.size) {
            content = (
                <div className="no-macro-container">
                    <h4>You don't have any macros yet.</h4>
                    <div className="ui large light blue labeled icon fluid button"
                         onClick={() => this.props.openModal()}>
                        <i className="plus icon"/>
                        CREATE A NEW MACRO
                    </div>
                </div>
            )
        }
        return (
            <div className="TicketMacros search ui raised segment">
                {content}
            </div>
        )
    }
}

TicketMacros.propTypes = {
    items: PropTypes.object.isRequired,
    selected: PropTypes.object,
    applyMacro: PropTypes.func.isRequired,
    previewMacro: PropTypes.func.isRequired,
    previewMacroInModal: PropTypes.func.isRequired,
    openModal: PropTypes.func.isRequired
}
