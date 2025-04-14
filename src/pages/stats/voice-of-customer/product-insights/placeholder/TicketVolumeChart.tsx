import ChartCard from 'pages/stats/common/components/ChartCard'
import css from 'pages/stats/ticket-insights/ticket-fields/TicketDistributionTable.less'
import { TICKET_VOLUME_CHART_LABEL } from 'pages/stats/voice-of-customer/product-insights/constants'
import { TicketVolumeTable } from 'pages/stats/voice-of-customer/product-insights/placeholder/TicketVolumeTable'

const selectedCustomFieldId: number | null = 123

export const TicketVolumeChart = () => {
    return (
        <ChartCard
            title={TICKET_VOLUME_CHART_LABEL}
            hint={{ title: TICKET_VOLUME_CHART_LABEL }}
            className={css.card}
            noPadding={true}
        >
            <TicketVolumeTable selectedCustomFieldId={selectedCustomFieldId} />
        </ChartCard>
    )
}
