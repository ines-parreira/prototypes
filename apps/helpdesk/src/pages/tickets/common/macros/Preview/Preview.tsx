import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import classnames from 'classnames'

import type { MacroAction } from '@gorgias/helpdesk-queries'

import type { TicketMessageSourceType } from 'business/types/ticket'
import { MacroActionName } from 'models/macroAction/types'

import { AddAttachmentsPreview } from './AddAttachmentsPreview'
import { AddTagsPreview } from './AddTagsPreview'
import { ForwardByEmailPreview } from './ForwardByEmailPreview'
import { IntegrationsPreview } from './IntegrationsPreview'
import { InternalNotePreview } from './InternalNotePreview'
import { ResponseTextPreview } from './ResponseTextPreview'
import { SetAssigneePreview } from './SetAssigneePreview'
import { SetCustomerCustomFieldValuesPreview } from './SetCustomerCustomFieldValuesPreview'
import { SetCustomFieldValuesPreview } from './SetCustomFieldValuesPreview'
import { SetPriorityPreview } from './SetPriorityPreview'
import { SetStatusPreview } from './SetStatusPreview'
import { SetSubjectPreview } from './SetSubjectPreview'
import { SetTeamAssigneePreview } from './SetTeamAssigneePreview'
import { SnoozeTicketPreview } from './SnoozeTicketPreview'

import css from './Preview.less'

type Props = {
    displayHTML?: boolean
    actions?: MacroAction[]
    ticketMessageSourceType?: TicketMessageSourceType
    className?: string
}

export const Preview = ({
    displayHTML,
    actions,
    ticketMessageSourceType,
    className,
}: Props) => {
    const isMacroResponseCcBccEnabled = useFlag(
        FeatureFlagKey.MacroResponseTextCcBcc,
    )
    const isMacroForwardByEmailEnabled = useFlag(
        FeatureFlagKey.MacroForwardByEmail,
    )

    if (!actions?.length) return null

    const findAction = (actionName: string) =>
        actions.find((action) => action?.name === actionName)

    return (
        <div className={classnames(css.component, className)}>
            <SetStatusPreview
                setStatusAction={findAction(MacroActionName.SetStatus)}
            />
            <SetPriorityPreview
                setPriorityAction={findAction(MacroActionName.SetPriority)}
            />
            <SnoozeTicketPreview
                snoozeTicketAction={findAction(MacroActionName.SnoozeTicket)}
            />
            <AddTagsPreview
                addTagsAction={findAction(MacroActionName.AddTags)}
            />
            <SetAssigneePreview
                setAssigneeAction={findAction(MacroActionName.SetAssignee)}
            />
            <SetTeamAssigneePreview
                setTeamAssigneeAction={findAction(
                    MacroActionName.SetTeamAssignee,
                )}
            />
            <SetSubjectPreview
                setSubjectAction={findAction(MacroActionName.SetSubject)}
            />
            <InternalNotePreview
                action={findAction(MacroActionName.AddInternalNote)}
            />
            <ForwardByEmailPreview
                action={findAction(MacroActionName.ForwardByEmail)}
                isMacroForwardByEmailEnabled={isMacroForwardByEmailEnabled}
            />
            <IntegrationsPreview actions={actions} />
            <AddAttachmentsPreview
                attachmentAction={findAction(MacroActionName.AddAttachments)}
            />
            <ResponseTextPreview
                responseTextAction={findAction(MacroActionName.SetResponseText)}
                displayHTML={displayHTML}
                ticketMessageSourceType={ticketMessageSourceType}
                isMacroResponseCcBccEnabled={isMacroResponseCcBccEnabled}
            />
            <SetCustomFieldValuesPreview actions={actions} />
            <SetCustomerCustomFieldValuesPreview actions={actions} />
        </div>
    )
}
