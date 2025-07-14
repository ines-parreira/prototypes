import {
    ReportName,
    useNotifyOnTimeReferenceChange,
} from 'domains/reporting/hooks/ticket-insights/useNotifyOnTimeReferenceChange'
import {
    Entity,
    useTicketTimeReference,
} from 'domains/reporting/hooks/ticket-insights/useTicketTimeReference'
import { TicketTimeReference } from 'domains/reporting/models/stat/types'
import {
    ActionMenu,
    ActionMenuItem,
    ActionMenuLabel,
    ActionMenuSelectGroup,
    ActionMenuSelectItem,
    ActionMenuSeparator,
} from 'domains/reporting/pages/common/components/ActionMenu'
import { useCustomFieldsReportData } from 'domains/reporting/services/ticketFieldsReportingService'
import IconInput from 'pages/common/forms/input/IconInput'

export const TICKET_FIELDS_LABEL = 'Set Ticket Field Results'
export const TICKET_FIELDS_ALL_STATUSES_LABEL =
    'Show results with Ticket Fields based on all ticket statuses'
export const TICKET_FIELDS_ALL_STATUSES_SUBTITLE =
    'Display Ticket Fields from all tickets within selected date range'
export const TICKET_FIELDS_CREATION_DATE_LABEL =
    'Show results with Ticket Fields based on when ticket field was applied'
export const TICKET_FIELDS_CREATION_DATE_SUBTITLE =
    'Only display Ticket Fields from created tickets within selected date range'
export const TICKET_FIELDS_DOWNLOAD_OPTION_LABEL = 'Download Data'

const CANDU_ID = 'ticket-fields-report-action-menu'

export const TicketFieldsActionMenu = ({
    ticketFieldId,
}: {
    ticketFieldId: number
}) => {
    const [ticketTimeReference, setTicketTimeReference] =
        useTicketTimeReference(Entity.TicketField)

    const { download, isLoading } = useCustomFieldsReportData(ticketFieldId)

    useNotifyOnTimeReferenceChange(ReportName.TicketFields, ticketTimeReference)

    return (
        <ActionMenu canduId={CANDU_ID}>
            <ActionMenuLabel>{TICKET_FIELDS_LABEL}</ActionMenuLabel>
            <ActionMenuSelectGroup
                value={ticketTimeReference}
                onValueChange={setTicketTimeReference}
            >
                <ActionMenuSelectItem
                    value={TicketTimeReference.TaggedAt}
                    label={TICKET_FIELDS_ALL_STATUSES_LABEL}
                    description={TICKET_FIELDS_ALL_STATUSES_SUBTITLE}
                />
                <ActionMenuSelectItem
                    value={TicketTimeReference.CreatedAt}
                    label={TICKET_FIELDS_CREATION_DATE_LABEL}
                    description={TICKET_FIELDS_CREATION_DATE_SUBTITLE}
                />
            </ActionMenuSelectGroup>

            <ActionMenuSeparator />

            <ActionMenuItem
                label={TICKET_FIELDS_DOWNLOAD_OPTION_LABEL}
                prefix={<IconInput icon="get_app" />}
                onClick={download}
                isDisabled={isLoading}
            />
        </ActionMenu>
    )
}
