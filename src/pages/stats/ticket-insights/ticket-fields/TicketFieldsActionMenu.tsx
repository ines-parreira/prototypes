import {
    ReportName,
    useNotifyOnTimeReferenceChange,
} from 'hooks/reporting/ticket-insights/useNotifyOnTimeReferenceChange'
import {
    Entity,
    useTicketTimeReference,
} from 'hooks/reporting/ticket-insights/useTicketTimeReference'
import { TicketTimeReference } from 'models/stat/types'
import IconInput from 'pages/common/forms/input/IconInput'
import {
    ActionMenu,
    ActionMenuItem,
    ActionMenuLabel,
    ActionMenuSelectGroup,
    ActionMenuSelectItem,
    ActionMenuSeparator,
} from 'pages/stats/common/components/ActionMenu'
import { useCustomFieldsReportData } from 'services/reporting/ticketFieldsReportingService'

export const TICKET_FIELDS_LABEL = 'Set Ticket Field Results'
export const TICKET_FIELDS_ALL_STATUSES_LABEL =
    'Show results with ticket fields based on all ticket statuses'
export const TICKET_FIELDS_ALL_STATUSES_SUBTITLE =
    'Display ticket fields from all tickets within selected date range'
export const TICKET_FIELDS_CREATION_DATE_LABEL =
    'Show results with ticket fields based on ticket creation date'
export const TICKET_FIELDS_CREATION_DATE_SUBTITLE =
    'Only display ticket fields from created tickets within selected date range'
export const TICKET_FIELDS_DOWNLOAD_OPTION_LABEL = 'Download Data'

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
        <ActionMenu>
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
