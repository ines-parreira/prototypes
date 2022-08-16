import React, {Component, ComponentProps} from 'react'
import classnames from 'classnames'
import {Badge} from 'reactstrap'
import {Map, List, fromJS} from 'immutable'

import {TicketMessageSourceType} from 'business/types/ticket'
import {isRichType} from 'config/ticket'
import {getIconFromActionType} from 'models/macroAction/helpers'

import {actionTypeToName, MacroActionName} from 'models/macroAction/types'
import DEPRECATED_RichField from 'pages/common/forms/RichField/DEPRECATED_RichField'

import {
    TagLabel,
    AgentLabel,
    StatusLabel,
    TimedeltaLabel,
    TeamLabel,
    RecipientsLabel,
} from 'pages/common/utils/labels'
import {
    fileIconFromContentType,
    getSortedIntegrationActions,
} from 'pages/tickets/common/utils'
import {FlagKey} from 'providers/FeatureFlags'
import FeatureFlagsContext from 'providers/FeatureFlags/context'
import {getActionTemplate} from 'utils'
import {sanitizeHtmlForFacebookMessenger} from 'utils/html'
import {ActionTemplateExecution} from 'config'

import css from './Preview.less'

type Props = {
    displayHTML?: boolean
    actions: List<Map<string, any>>
    ticketMessageSourceType?: TicketMessageSourceType
    className?: string
}

class Preview extends Component<Props> {
    renderAddAttachments = (attachmentAction?: Map<string, any>) => {
        if (!attachmentAction) return null

        return (
            <div className="mb-3">
                <strong className="text-muted mr-2">Attach files:</strong>
                {(
                    attachmentAction.getIn(['arguments', 'attachments']) as Map<
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

    renderResponseText(responseTextAction?: Map<string, any>) {
        if (!responseTextAction) return null

        const value: ComponentProps<typeof DEPRECATED_RichField>['value'] = {
            text: responseTextAction.getIn(['arguments', 'body_text']),
        }

        const hasSourceType = !!this.props.ticketMessageSourceType

        // If displayHTML is set to TRUE or
        // ticketMessageSourceTypeisRichType property is passed to the element and supports HTML content
        // then we don't strip the HTML tags, we use it as it is.
        // This is used for macro preview.
        if (
            this.props.displayHTML ||
            (hasSourceType && isRichType(this.props.ticketMessageSourceType!))
        ) {
            value.html = responseTextAction.getIn(['arguments', 'body_html'])
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

        const {cc, bcc} = (
            responseTextAction.get('arguments', fromJS({})) as Map<any, any>
        ).toJS()

        return (
            <>
                <FeatureFlagsContext.Consumer>
                    {({getFlag}) => {
                        const isMacroResponseCcBccEnabled = getFlag(
                            FlagKey.MacroResponseTextCcBcc
                        )

                        if (!isMacroResponseCcBccEnabled) {
                            return
                        }

                        return (
                            <>
                                {cc && (
                                    <div
                                        className={classnames(
                                            css.macroData,
                                            css.recipientsWrapper
                                        )}
                                    >
                                        <strong className="text-muted mr-2">
                                            Add as CC:
                                        </strong>
                                        <RecipientsLabel recipients={cc} />
                                    </div>
                                )}
                                {bcc && (
                                    <div
                                        className={classnames(
                                            css.macroData,
                                            css.recipientsWrapper
                                        )}
                                    >
                                        <strong className="text-muted mr-2">
                                            Add as BCC:
                                        </strong>
                                        <RecipientsLabel recipients={bcc} />
                                    </div>
                                )}
                            </>
                        )
                    }}
                </FeatureFlagsContext.Consumer>
                <div className={css.macroData}>
                    <DEPRECATED_RichField
                        value={value}
                        onChange={() => null}
                        displayOnly
                    />
                </div>
            </>
        )
    }

    renderSetStatus(setStatusAction?: Map<string, any>) {
        if (!setStatusAction) return null

        return (
            <div className={css.macroData}>
                <strong className="text-muted mr-2">Set status:</strong>
                <StatusLabel
                    status={setStatusAction.getIn(['arguments', 'status'])}
                />
            </div>
        )
    }

    renderSnoozeTicket(snoozeTicketAction?: Map<string, any>) {
        if (!snoozeTicketAction) return null

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

    renderAddTags(addTagsAction?: Map<string, any>) {
        if (!addTagsAction) return null

        return (
            <div className={classnames(css.macroData, css.addTagWrapper)}>
                <strong className="text-muted mr-2">Add tags:</strong>
                {(addTagsAction.getIn(['arguments', 'tags'], '') as string)
                    .split(',')
                    .map((tag) => (
                        <TagLabel key={tag}>{tag}</TagLabel>
                    ))}
            </div>
        )
    }

    renderSetAssignee(setAssigneeAction?: Map<string, any>) {
        if (!setAssigneeAction) return null

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

    renderSetTeamAssignee(setTeamAssigneeAction?: Map<string, any>) {
        if (!setTeamAssigneeAction) return null

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

    renderSetSubject(setSubjectAction?: Map<string, any>) {
        if (!setSubjectAction) return null

        return (
            <div className={css.macroData}>
                <strong className="text-muted mr-2">Set subject:</strong>
                <b className={css.integrationAction}>
                    {setSubjectAction.getIn(['arguments', 'subject'])}
                </b>
            </div>
        )
    }

    renderActions(integrationType: string, integrationActions: List<any>) {
        if (!integrationActions?.size) return null

        return (
            <div
                key={integrationType}
                className={classnames(css.macroData, css.integrationActions)}
            >
                <strong className="text-muted mr-2">
                    {actionTypeToName[integrationType]} actions:
                </strong>
                {integrationActions
                    .map(
                        (
                            action: Map<string, unknown>,
                            index: number | undefined
                        ) => (
                            <div
                                className={css.integrationAction}
                                key={`integration-action-${index as number}`}
                            >
                                <img
                                    alt={`${integrationType} logo`}
                                    src={getIconFromActionType(integrationType)}
                                    role="presentation"
                                    className={css.logo}
                                />
                                {action.get('title')}
                            </div>
                        )
                    )
                    .toJS()}
            </div>
        )
    }

    renderIntegrations(actions: List<Map<string, any>>) {
        return getSortedIntegrationActions(
            actions
                .filter(
                    (action) =>
                        getActionTemplate(action?.get('name'))?.execution ===
                            ActionTemplateExecution.External ||
                        action?.get('name') === MacroActionName.AddInternalNote
                )
                .toList()
        )
            .map((v, k) => this.renderActions(k, v))
            .toList()
            .toJS() as JSX.Element[]
    }

    render() {
        const {actions, className} = this.props
        if (!actions?.size) return null

        const findAction = (actionName: string) =>
            actions.find((action) => action?.get('name') === actionName)

        return (
            <div className={classnames(css.component, className)}>
                {this.renderSetStatus(findAction(MacroActionName.SetStatus))}
                {this.renderSnoozeTicket(
                    findAction(MacroActionName.SnoozeTicket)
                )}
                {this.renderAddTags(findAction(MacroActionName.AddTags))}
                {this.renderSetAssignee(
                    findAction(MacroActionName.SetAssignee)
                )}
                {this.renderSetTeamAssignee(
                    findAction(MacroActionName.SetTeamAssignee)
                )}
                {this.renderSetSubject(findAction(MacroActionName.SetSubject))}
                {this.renderIntegrations(actions)}
                {this.renderAddAttachments(
                    findAction(MacroActionName.AddAttachments)
                )}
                {this.renderResponseText(
                    findAction(MacroActionName.SetResponseText)
                )}
            </div>
        )
    }
}

export default Preview
