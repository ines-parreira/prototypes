import React, {Component, ComponentProps} from 'react'
import classnames from 'classnames'
import {Badge} from 'reactstrap'
import {Map} from 'immutable'

import {TicketMessageSourceType} from 'business/types/ticket'
import {isRichType} from 'config/ticket'
import {getIconFromActionType} from 'models/macroAction/helpers'

import {actionTypeToName} from 'models/macroAction/types'
import RichField from 'pages/common/forms/RichField/RichField'

import {
    TagLabel,
    AgentLabel,
    StatusLabel,
    TimedeltaLabel,
    TeamLabel,
} from 'pages/common/utils/labels'
import {
    fileIconFromContentType,
    getSortedIntegrationActions,
} from 'pages/tickets/common/utils.js'
import {getActionTemplate} from 'utils'
import {sanitizeHtmlForFacebookMessenger} from 'utils/html'

import css from './Preview.less'

type Props = {
    displayHTML?: boolean
    actions: Map<any, any>
    ticketMessageSourceType?: TicketMessageSourceType
    className?: string
}

class Preview extends Component<Props> {
    renderAddAttachments = (attachments: Map<any, any>) => {
        if (!attachments) {
            return null
        }
        return (
            <div className="mb-3">
                <strong className="text-muted mr-2">Attach files:</strong>
                {(
                    attachments.getIn(['arguments', 'attachments']) as Map<
                        any,
                        any
                    >
                ).map((file: Map<any, any>, index: number) => (
                    <Badge key={index} color="secondary" className="mr-1 mb-1">
                        <i className="material-icons mr-2">
                            {fileIconFromContentType(file.get('content_type'))}
                        </i>
                        {file.get('name')}
                    </Badge>
                ))}
            </div>
        )
    }

    renderResponseText(responseTextAction: Map<string, any>) {
        if (responseTextAction) {
            const value: ComponentProps<typeof RichField>['value'] = {
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
                    isRichType(this.props.ticketMessageSourceType!))
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

    renderSetStatus(setStatusAction: Map<string, any>) {
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

    renderSnoozeTicket(snoozeTicketAction: Map<string, any>) {
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

    renderAddTags(addTagsActions: Map<string, any>) {
        if (!addTagsActions || !addTagsActions.size) {
            return null
        }

        return (
            <div className={classnames(css.macroData, css.addTagWrapper)}>
                <strong className="text-muted mr-2">Add tags:</strong>
                {addTagsActions
                    .map((action: Map<string, any>) =>
                        (action.getIn(['arguments', 'tags'], '') as string)
                            .split(',')
                            .map((tag) => <TagLabel key={tag}>{tag}</TagLabel>)
                    )
                    .toJS()}
            </div>
        )
    }

    renderSetAssignee(setAssigneeAction: Map<string, any>) {
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

    renderSetTeamAssignee(setTeamAssigneeAction: Map<string, any>) {
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

    renderSetSubject(setSubjectAction: Map<string, any>) {
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

    renderBackActions(
        integrationType: string,
        integrationActions: Map<any, any>
    ) {
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
                    .map((action: Map<string, unknown>, index: number) => (
                        <div
                            className={css.integrationAction}
                            key={`integration-action-${index}`}
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
            (action: Map<any, any>) => action.get('name') === 'addTags'
        )
        const responseTextAction = actions.find(
            (action: Map<string, any>) =>
                action.get('name') === 'setResponseText'
        )
        const setStatusAction = actions.find(
            (action: Map<string, any>) => action.get('name') === 'setStatus'
        )
        const snoozeTicketAction = actions.find(
            (action: Map<string, any>) => action.get('name') === 'snoozeTicket'
        )
        const setAssigneeAction = actions.find(
            (action: Map<string, any>) => action.get('name') === 'setAssignee'
        )
        const setTeamAssigneeAction = actions.find(
            (action: Map<string, any>) =>
                action.get('name') === 'setTeamAssignee'
        )
        const setSubjectAction = actions.find(
            (action: Map<string, any>) => action.get('name') === 'setSubject'
        )
        const addAttachmentsActions = actions.find(
            (action: Map<any, any>) => action.get('name') === 'addAttachments'
        )
        const backActions = actions.filter(
            (action: Map<string, any>) =>
                getActionTemplate(action.get('name'))?.execution === 'back'
        )

        const sortedBackActions: Map<string, any> =
            getSortedIntegrationActions(backActions)

        return (
            <div className={classnames(css.component, className)}>
                {this.renderSetStatus(setStatusAction)}
                {this.renderSnoozeTicket(snoozeTicketAction)}
                {this.renderAddTags(addTagsActions as Map<string, any>)}
                {this.renderSetAssignee(setAssigneeAction)}
                {this.renderSetTeamAssignee(setTeamAssigneeAction)}
                {this.renderSetSubject(setSubjectAction)}
                {sortedBackActions
                    .map((v, k) => this.renderBackActions(k!, v))
                    .toList()
                    .toJS()}
                {this.renderAddAttachments(addAttachmentsActions)}
                {this.renderResponseText(responseTextAction)}
            </div>
        )
    }
}

export default Preview
