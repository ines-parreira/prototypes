import React, {PropTypes} from 'react'
import classnames from 'classnames'
import {mapFileFormatToSemanticIcon, getSortedIntegrationActions} from '../../common/utils'
import {AgentLabel} from '../../../common/utils/labels'
import {getIconFromType} from './../../../../state/integrations/helpers'
import {getActionTemplate, sanitizeHtmlDefault} from './../../../../utils'

class Preview extends React.Component {
    renderAddAttachments = (attachments) => {
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
                        action.getIn(['arguments', 'tags'], '').split(',').map((tag, i) => (
                            <div key={`action-tag-${action.id}-${i}`} className="ui label ticket-tag no-icon">
                                {tag}
                            </div>
                        ))
                    )).toJS()
                }
            </div>
        )
    }

    renderSetAssignee(setAssigneeAction) {
        if (!setAssigneeAction) {
            return null
        }

        return (
            <div className="macro-data">
                <div className="ui label macro-legend">ASSIGN TO:</div>
                <span
                    key={`action-assign-${setAssigneeAction.id}`}
                    className="ticket-owner-btn ticket-details-item"
                >
                    <AgentLabel name={setAssigneeAction.getIn(['arguments', 'assignee_user', 'name'])} />
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

    renderSetSubject(setSubjectAction) {
        if (!setSubjectAction) {
            return null
        }

        return (
            <div className="macro-data">
                <div className="ui label macro-legend">SET SUBJECT:</div>
                <b className="integration-action">
                    {setSubjectAction.getIn(['arguments', 'subject'])}
                </b>
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

    render() {
        const {macro, displayHTML} = this.props

        if (!macro || macro.isEmpty()) {
            return null
        }

        const addTagsActions = macro.get('actions').filter(action => action.get('name') === 'addTags')
        const responseTextAction = macro.get('actions').find(action => action.get('name') === 'setResponseText')
        const setStatusAction = macro.get('actions').find(action => action.get('name') === 'setStatus')
        const setPriorityAction = macro.get('actions').find(action => action.get('name') === 'setPriority')
        const setAssigneeAction = macro.get('actions').find(action => action.get('name') === 'setAssignee')
        const setSubjectAction = macro.get('actions').find(action => action.get('name') === 'setSubject')
        const addAttachmentsActions = macro.get('actions').find(action => action.get('name') === 'addAttachments')

        const backActions = macro.get('actions').filter(
            action => getActionTemplate(action.get('name')).execution === 'back'
        )

        const sortedBackActions = getSortedIntegrationActions(backActions)

        let textPreview = null
        if (responseTextAction) {
            const html = responseTextAction.getIn(['arguments', 'body_html'])
            const text = responseTextAction.getIn(['arguments', 'body_text'])
            if (html && displayHTML) {
                const body = sanitizeHtmlDefault(html)
                textPreview = (
                    <div
                        className="text-preview rich-content-wrapper"
                        dangerouslySetInnerHTML={{__html: body}}
                    />
                )
            } else {
                textPreview = <pre className="text-preview">{text}</pre>
            }
        }

        return (
            <div className="macro-preview">
                {this.renderSetStatus(setStatusAction)}
                {this.renderAddTags(addTagsActions)}
                {this.renderSetAssignee(setAssigneeAction)}
                {this.renderSetPriority(setPriorityAction)}
                {this.renderSetSubject(setSubjectAction)}
                {
                    sortedBackActions.map((v, k) => this.renderBackActions(k, v)).toList().toJS()
                }
                {this.renderAddAttachments(addAttachmentsActions)}
                {textPreview}
            </div>
        )
    }
}

Preview.propTypes = {
    displayHTML: PropTypes.bool.isRequired,
    macro: PropTypes.object.isRequired,
}

Preview.defaultProps = {
    displayHTML: true,
}

export default Preview
