import React from 'react'
import PropTypes from 'prop-types'
import _capitalize from 'lodash/capitalize'
import classnames from 'classnames'
import {Badge} from 'reactstrap'

import {
    fileIconFromContentType,
    getSortedIntegrationActions,
} from '../../common/utils'
import {TagLabel, AgentLabel, StatusLabel} from '../../../common/utils/labels'
import RichField from '../../../common/forms/RichField'

import {getIconFromType} from './../../../../state/integrations/helpers.ts'
import {getActionTemplate} from './../../../../utils'

import css from './Preview.less'

class Preview extends React.Component {
    renderAddAttachments = (attachments) => {
        if (!attachments) {
            return null
        }
        return (
            <div className="mb-3">
                <strong className="text-muted mr-2">Attach files:</strong>
                {attachments
                    .getIn(['arguments', 'attachments'])
                    .map((file, index) => (
                        <Badge
                            key={index}
                            color="secondary"
                            className="mr-1 mb-1"
                        >
                            <i className="material-icons mr-2">
                                {fileIconFromContentType(
                                    file.get('content_type')
                                )}
                            </i>
                            {file.get('name')}
                        </Badge>
                    ))}
            </div>
        )
    }

    renderResponseText(responseTextAction) {
        if (responseTextAction) {
            const value = {
                text: responseTextAction.getIn(['arguments', 'body_text']),
            }

            if (this.props.displayHTML) {
                value.html = responseTextAction.getIn([
                    'arguments',
                    'body_html',
                ])
            }

            return (
                <div className={css.macroData}>
                    <RichField
                        value={value}
                        onChange={() => null}
                        displayOnly
                    />
                </div>
            )
        }
    }

    renderSetStatus(setStatusAction) {
        if (setStatusAction) {
            return (
                <div className={css.macroData}>
                    <strong className="text-muted mr-2">Set status:</strong>
                    <StatusLabel
                        status={setStatusAction.getIn(['arguments', 'status'])}
                    />
                </div>
            )
        }
    }

    renderAddTags(addTagsActions) {
        if (!addTagsActions || !addTagsActions.size) {
            return null
        }

        return (
            <div className={css.macroData}>
                <strong className="text-muted mr-2">Add tags:</strong>
                {addTagsActions
                    .map((action) =>
                        action
                            .getIn(['arguments', 'tags'], '')
                            .split(',')
                            .map((tag) => <TagLabel key={tag}>{tag}</TagLabel>)
                    )
                    .toJS()}
            </div>
        )
    }

    renderSetAssignee(setAssigneeAction) {
        if (!setAssigneeAction) {
            return null
        }

        return (
            <div className={css.macroData}>
                <strong className="text-muted mr-2 align-middle">
                    Assign to:
                </strong>
                <span
                    key={`action-assign-${setAssigneeAction.id}`}
                    className="ticket-owner-btn ticket-details-item"
                >
                    <AgentLabel
                        className="align-middle"
                        name={setAssigneeAction.getIn([
                            'arguments',
                            'assignee_user',
                            'name',
                        ])}
                    />
                </span>
            </div>
        )
    }

    renderSetSubject(setSubjectAction) {
        if (!setSubjectAction) {
            return null
        }

        return (
            <div className={css.macroData}>
                <strong className="text-muted mr-2">Set subject:</strong>
                <b className={css.integrationAction}>
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
                className={classnames(css.macroData, css.integrationActions)}
            >
                <strong className="text-muted mr-2">
                    {_capitalize(integrationType)} actions:
                </strong>
                {integrationActions
                    .map((action, idx) => (
                        <div
                            className={css.integrationAction}
                            key={`integration-action-${idx}`}
                        >
                            <img
                                alt={`${integrationType} logo`}
                                src={getIconFromType(integrationType)}
                                role="presentation"
                                className={css.logo}
                            />
                            {action.get('title')}
                        </div>
                    ))
                    .toJS()}
            </div>
        )
    }

    render() {
        const {macro, className} = this.props

        if (!macro || macro.isEmpty()) {
            return null
        }

        const addTagsActions = macro
            .get('actions')
            .filter((action) => action.get('name') === 'addTags')
        const responseTextAction = macro
            .get('actions')
            .find((action) => action.get('name') === 'setResponseText')
        const setStatusAction = macro
            .get('actions')
            .find((action) => action.get('name') === 'setStatus')
        const setAssigneeAction = macro
            .get('actions')
            .find((action) => action.get('name') === 'setAssignee')
        const setSubjectAction = macro
            .get('actions')
            .find((action) => action.get('name') === 'setSubject')
        const addAttachmentsActions = macro
            .get('actions')
            .find((action) => action.get('name') === 'addAttachments')

        const backActions = macro
            .get('actions')
            .filter(
                (action) =>
                    getActionTemplate(action.get('name')).execution === 'back'
            )

        const sortedBackActions = getSortedIntegrationActions(backActions)

        return (
            <div className={classnames(css.component, className)}>
                {this.renderSetStatus(setStatusAction)}
                {this.renderAddTags(addTagsActions)}
                {this.renderSetAssignee(setAssigneeAction)}
                {this.renderSetSubject(setSubjectAction)}
                {sortedBackActions
                    .map((v, k) => this.renderBackActions(k, v))
                    .toList()
                    .toJS()}
                {this.renderAddAttachments(addAttachmentsActions)}
                {this.renderResponseText(responseTextAction)}
            </div>
        )
    }
}

Preview.propTypes = {
    displayHTML: PropTypes.bool.isRequired,
    macro: PropTypes.object.isRequired,
    className: PropTypes.string,
}

Preview.defaultProps = {
    displayHTML: true,
}

export default Preview
