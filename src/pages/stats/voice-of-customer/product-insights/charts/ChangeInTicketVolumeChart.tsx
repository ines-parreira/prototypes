import ChartCard from 'pages/stats/common/components/ChartCard'
import css from 'pages/stats/ticket-insights/ticket-fields/TicketDistributionTable.less'
import { TicketVolumeTable } from 'pages/stats/voice-of-customer/product-insights/charts/TicketVolumeTable'
import {
    TICKET_VOLUME_CHART_LABEL,
    TICKET_VOLUME_CHART_TOOLTIP,
} from 'pages/stats/voice-of-customer/product-insights/constants'

export const ChangeInTicketVolumeChart = () => {
    return (
        <ChartCard
            title={TICKET_VOLUME_CHART_LABEL}
            hint={{ title: TICKET_VOLUME_CHART_TOOLTIP }}
            className={css.card}
            noPadding={true}
        >
            <TicketVolumeTable />
        </ChartCard>
    )
}
