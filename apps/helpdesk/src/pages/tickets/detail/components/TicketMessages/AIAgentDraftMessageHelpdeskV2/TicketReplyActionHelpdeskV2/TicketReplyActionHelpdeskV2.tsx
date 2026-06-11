import type { ReactNode } from 'react'

import { Text } from '@gorgias/axiom'

import type { MacroAction } from 'models/macroAction/types'
import {
    getActionTitle,
    getFallbackSummaries,
} from 'pages/tickets/detail/components/TicketMessages/AIAgentDraftMessageHelpdeskV2/TicketReplyActionHelpdeskV2/utils'

import {
    ActionContentPreview,
    AssigneePreview,
    AttachmentsPreview,
    FallbackPreview,
    ForwardByEmailPreview,
    PriorityPreview,
    ReadonlyTextFieldPreview,
    SnoozePreview,
    StatusPreview,
    SuccessStatePreview,
    TagsPreview,
    TeamAssigneePreview,
} from './components'

import css from './TicketReplyActionHelpdeskV2.less'

type TicketReplyActionHelpdeskV2Props = {
    action: MacroAction
}

type ActionPreviewRenderer = (action: MacroAction) => ReactNode

const ACTION_NAMES = {
    AddAttachments: 'addAttachments',
    AddInternalNote: 'addInternalNote',
    AddTags: 'addTags',
    ExcludeFromAutoMerge: 'excludeFromAutoMerge',
    ExcludeFromCSAT: 'excludeFromCSAT',
    ForwardByEmail: 'forwardByEmail',
    RemoveTags: 'removeTags',
    SetAssignee: 'setAssignee',
    SetCustomFieldValue: 'setCustomFieldValue',
    SetCustomerCustomFieldValue: 'setCustomerCustomFieldValue',
    SetPriority: 'setPriority',
    SetStatus: 'setStatus',
    SetSubject: 'setSubject',
    SetTeamAssignee: 'setTeamAssignee',
    SnoozeTicket: 'snoozeTicket',
} as const

type SupportedActionName = (typeof ACTION_NAMES)[keyof typeof ACTION_NAMES]

const ACTION_PREVIEW_RENDERERS: Partial<
    Record<SupportedActionName, ActionPreviewRenderer>
> = {
    [ACTION_NAMES.AddTags]: (action) => (
        <TagsPreview tags={action.arguments.tags} />
    ),
    [ACTION_NAMES.RemoveTags]: (action) => (
        <TagsPreview tags={action.arguments.tags} />
    ),
    [ACTION_NAMES.SetStatus]: (action) => (
        <StatusPreview status={action.arguments.status} />
    ),
    [ACTION_NAMES.SetPriority]: (action) => (
        <PriorityPreview priority={action.arguments.priority} />
    ),
    [ACTION_NAMES.SnoozeTicket]: (action) => (
        <SnoozePreview value={action.arguments.snooze_timedelta} />
    ),
    [ACTION_NAMES.SetAssignee]: (action) => (
        <AssigneePreview
            name={action.arguments.assignee_user?.name}
            profilePictureUrl={
                action.arguments.assignee_user?.meta?.profile_picture_url
            }
        />
    ),
    [ACTION_NAMES.SetTeamAssignee]: (action) => (
        <TeamAssigneePreview name={action.arguments.assignee_team?.name} />
    ),
    [ACTION_NAMES.SetSubject]: (action) => (
        <ReadonlyTextFieldPreview
            ariaLabel="Suggested ticket subject"
            value={action.arguments.subject}
            emptyFallback=""
        />
    ),
    [ACTION_NAMES.AddAttachments]: (action) => (
        <AttachmentsPreview attachments={action.arguments.attachments} />
    ),
    [ACTION_NAMES.ExcludeFromAutoMerge]: () => <SuccessStatePreview />,
    [ACTION_NAMES.ExcludeFromCSAT]: () => <SuccessStatePreview />,
    [ACTION_NAMES.SetCustomFieldValue]: (action) => (
        <ReadonlyTextFieldPreview value={action.arguments.value} />
    ),
    [ACTION_NAMES.SetCustomerCustomFieldValue]: (action) => (
        <ReadonlyTextFieldPreview value={action.arguments.value} />
    ),
    [ACTION_NAMES.AddInternalNote]: (action) => (
        <ActionContentPreview
            bodyHtml={action.arguments.body_html}
            bodyText={action.arguments.body_text}
        />
    ),
    [ACTION_NAMES.ForwardByEmail]: (action) => (
        <ForwardByEmailPreview
            to={action.arguments.to}
            cc={action.arguments.cc}
            bcc={action.arguments.bcc}
            from={action.arguments.from}
            bodyHtml={action.arguments.body_html}
            bodyText={action.arguments.body_text}
        />
    ),
}

function renderPrimaryActionValue(action: MacroAction) {
    const renderer =
        ACTION_PREVIEW_RENDERERS[action.name as SupportedActionName]

    if (renderer) {
        return renderer(action)
    }

    return <FallbackPreview summaries={getFallbackSummaries(action)} />
}

function ActionRow({
    action,
    children,
}: TicketReplyActionHelpdeskV2Props & {
    children: ReactNode
}) {
    return (
        <div className={css.row}>
            <Text size="sm" variant="bold" color="content-neutral-default">
                {getActionTitle(action)}
            </Text>
            <div className={css.rowValueContainer}>{children}</div>
        </div>
    )
}

export function TicketReplyActionHelpdeskV2({
    action,
}: TicketReplyActionHelpdeskV2Props) {
    return (
        <ActionRow action={action}>
            {renderPrimaryActionValue(action)}
        </ActionRow>
    )
}
