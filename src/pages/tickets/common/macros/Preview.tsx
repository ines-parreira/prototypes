import React, {
    Component,
    ComponentClass,
    ComponentProps,
    ReactNode,
} from 'react'

import classnames from 'classnames'
import { LDFlagSet } from 'launchdarkly-js-client-sdk'
import { withLDConsumer } from 'launchdarkly-react-client-sdk'
import { Badge } from 'reactstrap'

import { File, MacroAction } from '@gorgias/api-queries'

import { TicketMessageSourceType } from 'business/types/ticket'
import { ActionTemplateExecution } from 'config'
import { FeatureFlagKey } from 'config/featureFlags'
import { useCustomFieldDefinition } from 'custom-fields/hooks/queries/useCustomFieldDefinition'
import { CustomField } from 'custom-fields/types'
import { getIconFromActionType } from 'models/macroAction/helpers'
import { actionTypeToName, MacroActionName } from 'models/macroAction/types'
import TicketTag from 'pages/common/components/TicketTag'
import TicketRichField from 'pages/common/forms/RichField/TicketRichField'
import {
    AgentLabel,
    RecipientsLabel,
    StatusLabel,
    TeamLabel,
    TimedeltaLabel,
} from 'pages/common/utils/labels'
import {
    fileIconFromContentType,
    getSortedIntegrationActions,
} from 'pages/tickets/common/utils'
import { isRichType } from 'tickets/common/utils'
import { getActionTemplate } from 'utils'
import { sanitizeHtmlForFacebookMessenger } from 'utils/html'

import css from './Preview.less'

type Props = {
    displayHTML?: boolean
    actions?: MacroAction[]
    ticketMessageSourceType?: TicketMessageSourceType
    className?: string
    flags: LDFlagSet
}

class Preview extends Component<Props> {
    renderAddAttachments = (attachmentAction?: MacroAction) => {
        if (!attachmentAction) return null

        return (
            <div className="mb-3">
                <strong className="text-muted mr-2">Attach files:</strong>
                {(
                    attachmentAction.arguments as { attachments: File[] }
                ).attachments.map((file, index: number) => (
                    <Badge key={index} color="secondary" className="mr-1 mb-1">
                        <i className="material-icons mr-2">
                            {fileIconFromContentType(file.content_type ?? '')}
                        </i>
                        {file.name}
                    </Badge>
                ))}
            </div>
        )
    }

    renderResponseText(responseTextAction?: MacroAction) {
        if (!responseTextAction) return null

        const { body_html, body_text, cc, bcc } =
            responseTextAction.arguments as {
                body_html?: string
                body_text?: string
                cc?: string
                bcc?: string
            }

        const value: ComponentProps<typeof TicketRichField>['value'] = {
            text: body_text,
        }

        const hasSourceType = !!this.props.ticketMessageSourceType

        // If displayHTML is set to TRUE or
        // ticketMessageSourceTypeisRichType property is passed to the element and supports HTML content
        // then we don't strip the HTML tags, we use it as it is.
        // This is used for macro preview.
        if (
            this.props.displayHTML ||
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            (hasSourceType && isRichType(this.props.ticketMessageSourceType!))
        ) {
            value.html = body_html
            // This is used for ticket macros
        } else if (
            hasSourceType &&
            this.props.ticketMessageSourceType ===
                TicketMessageSourceType.FacebookMessenger
        ) {
            // Get body_html as text
            let html = body_html

            html = sanitizeHtmlForFacebookMessenger(html ?? '')
            value.html = html
        }

        const isMacroResponseCcBccEnabled: boolean | undefined =
            this.props.flags[FeatureFlagKey.MacroResponseTextCcBcc]

        return (
            <>
                {isMacroResponseCcBccEnabled && (
                    <>
                        {cc && (
                            <div
                                className={classnames(
                                    css.macroData,
                                    css.recipientsWrapper,
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
                                    css.recipientsWrapper,
                                )}
                            >
                                <strong className="text-muted mr-2">
                                    Add as BCC:
                                </strong>
                                <RecipientsLabel recipients={bcc} />
                            </div>
                        )}
                    </>
                )}

                <div className={css.macroData}>
                    <TicketRichField
                        value={value}
                        onChange={() => null}
                        displayOnly
                    />
                </div>
            </>
        )
    }

    renderSetStatus(setStatusAction?: MacroAction) {
        if (!setStatusAction) return null

        return (
            <div className={css.macroData}>
                <strong className="text-muted mr-2">Set status:</strong>
                <StatusLabel
                    status={setStatusAction.arguments.status as string}
                />
            </div>
        )
    }

    renderSnoozeTicket(snoozeTicketAction?: MacroAction) {
        if (!snoozeTicketAction) return null

        const duration = snoozeTicketAction.arguments.snooze_timedelta as string

        return (
            <div className={css.macroData}>
                <strong className="text-muted">Snooze for </strong>
                <TimedeltaLabel duration={duration} />
            </div>
        )
    }

    renderAddTags(addTagsAction?: MacroAction) {
        if (!addTagsAction) return null

        return (
            <div className={classnames(css.macroData, css.addTagWrapper)}>
                <strong className="text-muted">Add tags:</strong>
                {(addTagsAction.arguments.tags as string)
                    .split(',')
                    .map((tag) => (
                        <TicketTag text={tag} key={tag} />
                    ))}
            </div>
        )
    }

    renderSetAssignee(setAssigneeAction?: MacroAction) {
        if (!setAssigneeAction) return null

        return (
            <div className={css.macroData}>
                <strong className="text-muted mr-2 align-middle">
                    Assign to user:
                </strong>
                <span>
                    <AgentLabel
                        className="align-middle"
                        name={
                            (
                                setAssigneeAction.arguments as {
                                    assignee_user: { name: string } | null
                                }
                            ).assignee_user?.name
                        }
                    />
                </span>
            </div>
        )
    }

    renderSetTeamAssignee(setTeamAssigneeAction?: MacroAction) {
        if (!setTeamAssigneeAction) return null

        return (
            <div className={css.macroData}>
                <strong className="text-muted mr-2 align-middle">
                    Assign to team:
                </strong>
                <span>
                    <TeamLabel
                        className="align-middle"
                        name={
                            (
                                setTeamAssigneeAction.arguments as {
                                    assignee_team: { name: string }
                                }
                            ).assignee_team?.name
                        }
                    />
                </span>
            </div>
        )
    }

    renderSetSubject(setSubjectAction?: MacroAction) {
        if (!setSubjectAction) return null

        return (
            <div className={css.macroData}>
                <strong className="text-muted mr-2">Set subject:</strong>
                <b className={css.integrationAction}>
                    {setSubjectAction.arguments.subject}
                </b>
            </div>
        )
    }

    renderInternalNote(action?: MacroAction) {
        if (!action) return null
        return (
            <div className={css.macroData}>
                <strong className="text-muted mr-2 align-middle">
                    Send internal note:
                </strong>
                <span
                    className={classnames(
                        'material-icons mr-2',
                        css.icon,
                        css.internalNoteIcon,
                    )}
                >
                    note
                </span>
                <span className={css.internalNote}>{action.title}</span>
            </div>
        )
    }

    renderForwardByEmail(
        isMacroForwardByEmailEnabled: boolean,
        action?: MacroAction,
    ) {
        if (!action || !isMacroForwardByEmailEnabled) return null

        return (
            <div className={css.macroData}>
                <strong className="text-muted mr-2 align-middle">
                    {action.title}:
                </strong>
                <span className={classnames('material-icons mr-2', css.icon)}>
                    forward
                </span>
                <span className={css.internalNote}>
                    {action.arguments.to as string}
                </span>
            </div>
        )
    }

    renderSetCustomFieldValues() {
        const SCFActions = this.props.actions?.filter(
            (action) => action.name === MacroActionName.SetCustomFieldValue,
        )

        if (!SCFActions?.length) return null

        return SCFActions.map((action, index) => (
            <div className={css.macroData} key={index}>
                <strong className="text-muted mr-2">
                    <CustomFieldName
                        customFieldId={
                            action.arguments
                                ?.custom_field_id as CustomField['id']
                        }
                    />
                    :
                </strong>
                <b className={css.integrationAction}>
                    {action.arguments?.value as ReactNode}
                </b>
            </div>
        ))
    }

    renderActions(integrationType: string, integrationActions: MacroAction[]) {
        if (!integrationActions?.length) return null

        return (
            <div
                key={integrationType}
                className={classnames(css.macroData, css.integrationActions)}
            >
                <strong className="text-muted mr-2">
                    {actionTypeToName[integrationType]} actions:
                </strong>
                {integrationActions.map(
                    (action: MacroAction, index: number | undefined) => (
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
                            {action.title}
                        </div>
                    ),
                )}
            </div>
        )
    }

    renderIntegrations(actions: MacroAction[]) {
        return Object.entries(
            getSortedIntegrationActions(
                actions.filter(
                    (action) =>
                        getActionTemplate(action.name)?.execution ===
                        ActionTemplateExecution.External,
                ),
            ) as {
                [key: string]: MacroAction[]
            },
        ).map(([k, v]) => this.renderActions(k, v))
    }

    render() {
        const { actions, className, flags } = this.props
        if (!actions?.length) return null

        const isMacroForwardByEmailEnabled =
            flags[FeatureFlagKey.MacroForwardByEmail]

        const findAction = (actionName: string) =>
            actions.find((action) => action?.name === actionName)

        return (
            <div className={classnames(css.component, className)}>
                {this.renderSetStatus(findAction(MacroActionName.SetStatus))}
                {this.renderSnoozeTicket(
                    findAction(MacroActionName.SnoozeTicket),
                )}
                {this.renderAddTags(findAction(MacroActionName.AddTags))}
                {this.renderSetAssignee(
                    findAction(MacroActionName.SetAssignee),
                )}
                {this.renderSetTeamAssignee(
                    findAction(MacroActionName.SetTeamAssignee),
                )}
                {this.renderSetSubject(findAction(MacroActionName.SetSubject))}
                {this.renderInternalNote(
                    findAction(MacroActionName.AddInternalNote),
                )}
                {this.renderForwardByEmail(
                    isMacroForwardByEmailEnabled,
                    findAction(MacroActionName.ForwardByEmail),
                )}
                {this.renderIntegrations(actions)}
                {this.renderAddAttachments(
                    findAction(MacroActionName.AddAttachments),
                )}
                {this.renderResponseText(
                    findAction(MacroActionName.SetResponseText),
                )}
                {this.renderSetCustomFieldValues()}
            </div>
        )
    }
}

export default withLDConsumer()(
    Preview as any as ComponentClass<Omit<Props, 'flags'>>,
)

export function CustomFieldName({
    customFieldId,
}: {
    customFieldId: CustomField['id']
}) {
    const { data, isLoading } = useCustomFieldDefinition(customFieldId)
    if (isLoading) return null

    return (
        <span>
            {data?.deactivated_datetime ? <strong>Archived </strong> : ''}
            Field {data?.label}
        </span>
    )
}
