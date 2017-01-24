import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import {mapFileFormatToSemanticIcon, getSortedIntegrationActions} from '../../../common/utils'
import {AgentLabel} from '../../../../common/utils/labels'
import {getIconFromType} from './../../../../../state/integrations/helpers'
import {getActionTemplate} from './../../../../../utils'

export default class TicketMacros extends React.Component {
    openModalOnSelectedMacro(selectedMacroId) {
        this.props.previewMacroInModal(selectedMacroId)
        this.props.openModal()
    }

    renderMacroListItem = (macro) => {
        const containerOpts = {
            key: macro.get('id'),
            className: classnames('item macro-item', {
                active: macro.get('id') === this.props.macros.getIn(['selected', 'id'])
            }),
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

    _renderAddAttachments = (attachments) => {
        if (!attachments) {
            return null
        }
        return (
            <div className="macro-data">
                <div className="ui label macro-legend">ATTACH FILES:</div>
                {attachments.getIn(['arguments', 'attachments']).map((file, index) => (
                    <div key={index} className="ui label mb5i">
                        <i className={`${mapFileFormatToSemanticIcon(file.get('content_type'))} icon`} />
                        {file.get('name')}
                    </div>
                ))}
            </div>
        )
    }

    renderSetStatus(setStatusAction) {
        if (setStatusAction) {
            return (
                <div className="macro-data">
                    <div className="ui label macro-legend">SET STATUS:</div>
                    <div className={`ui label smaller ticket-status ${setStatusAction.getIn(['arguments', 'status'])}`}>
                        {setStatusAction.getIn(['arguments', 'status'])}
                    </div>
                </div>
            )
        }
    }

    renderAddTags(addTagsActions) {
        if (!addTagsActions || !addTagsActions.size) {
            return null
        }

        return (
            <div className="macro-data">
                <div className="ui label macro-legend">ADD TAGS:</div>
                {
                    addTagsActions.map((action) => (
                        action.getIn(['arguments', 'tags']).split(',').map((tag, i) => (
                            <div key={`action-tag-${action.id}-${i}`} className="ui label ticket-tag no-icon">
                                {tag}
                            </div>
                        ))
                    )).toJS()
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
                    <AgentLabel name={assignUserAction.getIn(['arguments', 'assignee_user', 'name'])} />
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

    renderBackActions(integrationType, integrationActions) {
        if (!integrationActions || !integrationActions.size) {
            return null
        }

        return (
            <div
                key={integrationType}
                className="macro-data integration-actions"
            >
                <div className="ui label macro-legend">
                    {integrationType.toUpperCase()} ACTIONS:
                </div>
                {
                    integrationActions.map((action, idx) =>
                        <div
                            className="integration-action"
                            key={`integration-action-${idx}`}
                        >
                            <img
                                src={getIconFromType(integrationType)}
                                role="presentation"
                                className="logo"
                            />
                            {action.get('title')}
                        </div>
                    ).toJS()
                }
            </div>
        )
    }


    renderSelectedMacro = () => {
        const macro = this.props.macros.get('selected')

        if (!macro || macro.isEmpty()) {
            return null
        }

        const addTagsActions = macro.get('actions').filter(action => action.get('name') === 'addTags')
        const responseTextAction = macro.get('actions').find(action => action.get('name') === 'setResponseText')
        const setStatusAction = macro.get('actions').find(action => action.get('name') === 'setStatus')
        const setPriorityAction = macro.get('actions').find(action => action.get('name') === 'setPriority')
        const assignUserAction = macro.get('actions').find(action => action.get('name') === 'assignUser')
        const addAttachmentsActions = macro.get('actions').find(action => action.get('name') === 'addAttachments')

        const backActions = macro.get('actions').filter(
            action => getActionTemplate(action.get('name')).execution === 'back'
        )

        const sortedBackActions = getSortedIntegrationActions(backActions)

        let textPreview = null
        if (responseTextAction) {
            const html = responseTextAction.getIn(['arguments', 'body_html'])
            const text = responseTextAction.getIn(['arguments', 'body_text'])
            if (text) {
                textPreview = <pre className="text-preview">{text}</pre>
            } else {
                textPreview = <div className="text-preview" dangerouslySetInnerHTML={{__html: html}}></div>
            }
        }

        return (
            <div className="macro-preview">
                <div>
                    <a
                        className="ui right floated basic label"
                        onClick={() => this.openModalOnSelectedMacro(macro.get('id'))}
                    >
                        MANAGE MACROS
                    </a>
                    {this.renderSetStatus(setStatusAction)}
                    {this.renderAddTags(addTagsActions)}
                    {this.renderAssignUser(assignUserAction)}
                    {this.renderSetPriority(setPriorityAction)}
                    {
                        sortedBackActions.map((v, k) => this.renderBackActions(k, v)).toList().toJS()
                    }
                    {this._renderAddAttachments(addAttachmentsActions)}
                    {textPreview}
                </div>
            </div>
        )
    }

    render() {
        const items = this.props.macros.get('items')

        let content = (
            <div className="ui grid">
                <div className="macro-list four wide column">
                    <div className="ui aligned selection relaxed list">
                        {items.map(this.renderMacroListItem).toList()}
                    </div>
                </div>
                <div className="macro-preview-container twelve wide column">
                    <div className="macro-detail">
                        {this.renderSelectedMacro()}
                    </div>
                </div>
            </div>
        )

        if (!items.size) {
            content = (
                <div className="no-result-container">
                    <h4>You don't have any macros yet.</h4>
                    <div
                        className="ui small light labeled icon blue button"
                        onClick={() => this.props.openModal()}
                    >
                        <i className="plus icon" />
                        Create a new macro
                    </div>
                </div>
            )
        }
        return (
            <div className="TicketMacros">
                {content}
            </div>
        )
    }
}

TicketMacros.propTypes = {
    macros: PropTypes.object.isRequired,
    applyMacro: PropTypes.func.isRequired,
    previewMacro: PropTypes.func.isRequired,
    previewMacroInModal: PropTypes.func.isRequired,
    openModal: PropTypes.func.isRequired
}

TicketMacros.defaultProps = {
    macros: fromJS({})
}
