import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import {Badge} from 'reactstrap'

import css from './Preview.less'

import {TicketMessageSourceType} from 'business/types/ticket.ts'
import {isRichType} from 'config/ticket.ts'
import {getIconFromActionType} from 'models/macroAction/helpers'
import {actionTypeToName} from 'models/macroAction/types'
import RichField from 'pages/common/forms/RichField'
import {
    TagLabel,
    AgentLabel,
    StatusLabel,
    TimedeltaLabel,
    TeamLabel,
} from 'pages/common/utils/labels.tsx'
import {
    fileIconFromContentType,
    getSortedIntegrationActions,
} from 'pages/tickets/common/utils'
import {getActionTemplate} from 'utils.ts'
import {sanitizeHtmlForFacebookMessenger} from 'utils/html.ts'

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

            const hasSourceType = !!this.props.ticketMessageSourceType

            // If displayHTML is set to TRUE or
            // ticketMessageSourceTypeisRichType property is passed to the element and supports HTML content
            // then we don't strip the HTML tags, we use it as it is.
            // This is used for macro preview.
            if (
                this.props.displayHTML ||
                (hasSourceType &&
                    isRichType(this.props.ticketMessageSourceType))
            ) {
                value.html = responseTextAction.getIn([
                    'arguments',
                    'body_html',
                ])
                // This is used for ticket macros
            } else if (
                hasSourceType &&
                this.props.ticketMessageSourceType ===
                    TicketMessageSourceType.FacebookMessenger
            ) {
                // Get body_html as text
                let html = responseTextAction.getIn(['arguments', 'body_html'])

                html = sanitizeHtmlForFacebookMessenger(html)
                value.html = html
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

    renderSnoozeTicket(snoozeTicketAction) {
        if (snoozeTicketAction) {
            const duration = snoozeTicketAction.getIn([
                'arguments',
                'snooze_timedelta',
            ])
            return (
                <div className={css.macroData}>
                    <strong className="text-muted">Snooze for </strong>
                    <TimedeltaLabel duration={duration} />
                </div>
            )
        }
    }

    renderAddTags(addTagsActions) {
        if (!addTagsActions || !addTagsActions.size) {
            return null
        }

        return (
            <div className={classnames(css.macroData, css.addTagWrapper)}>
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
                    Assign to user:
                </strong>
                <span>
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

    renderSetTeamAssignee(setTeamAssigneeAction) {
        if (!setTeamAssigneeAction) {
            return null
        }

        return (
            <div className={css.macroData}>
                <strong className="text-muted mr-2 align-middle">
                    Assign to team:
                </strong>
                <span>
                    <TeamLabel
                        className="align-middle"
                        name={setTeamAssigneeAction.getIn([
                            'arguments',
                            'assignee_team',
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
                    {actionTypeToName[integrationType]} actions:
                </strong>
                {integrationActions
                    .map((action, idx) => (
                        <div
                            className={css.integrationAction}
                            key={`integration-action-${idx}`}
                        >
                            <img
                                alt={`${integrationType} logo`}
                                src={getIconFromActionType(integrationType)}
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
        const {actions, className} = this.props

        if (!actions || !actions.size) {
            return null
        }

        const addTagsActions = actions.filter(
            (action) => action.get('name') === 'addTags'
        )
        const responseTextAction = actions.find(
            (action) => action.get('name') === 'setResponseText'
        )
        const setStatusAction = actions.find(
            (action) => action.get('name') === 'setStatus'
        )
        const snoozeTicketAction = actions.find(
            (action) => action.get('name') === 'snoozeTicket'
        )
        const setAssigneeAction = actions.find(
            (action) => action.get('name') === 'setAssignee'
        )
        const setTeamAssigneeAction = actions.find(
            (action) => action.get('name') === 'setTeamAssignee'
        )
        const setSubjectAction = actions.find(
            (action) => action.get('name') === 'setSubject'
        )
        const addAttachmentsActions = actions.find(
            (action) => action.get('name') === 'addAttachments'
        )
        const backActions = actions.filter(
            (action) =>
                getActionTemplate(action.get('name')).execution === 'back'
        )

        const sortedBackActions = getSortedIntegrationActions(backActions)

        return (
            <div className={classnames(css.component, className)}>
                {this.renderSetStatus(setStatusAction)}
                {this.renderSnoozeTicket(snoozeTicketAction)}
                {this.renderAddTags(addTagsActions)}
                {this.renderSetAssignee(setAssigneeAction)}
                {this.renderSetTeamAssignee(setTeamAssigneeAction)}
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
    displayHTML: PropTypes.bool,
    actions: PropTypes.object.isRequired,
    ticketMessageSourceType: PropTypes.string,
    className: PropTypes.string,
}

export default Preview
