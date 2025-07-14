import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import css from 'domains/reporting/pages/ticket-insights/ticket-fields/TicketDistributionTable.less'
import { ChangeInTicketVolumeChartConfig } from 'domains/reporting/pages/voice-of-customer/charts/ChangeInTicketVolumeChart/ticketVolumeConfig'
import { TicketVolumeTable } from 'domains/reporting/pages/voice-of-customer/charts/ChangeInTicketVolumeChart/TicketVolumeTable'
import { ProductsPerTicketColumn } from 'domains/reporting/state/ui/stats/productsPerTicketSlice'

export const ChangeInTicketVolumeChart = () => {
    return (
        <ChartCard
            title={
                ChangeInTicketVolumeChartConfig[
                    ProductsPerTicketColumn.TicketVolume
                ].title
            }
            hint={
                ChangeInTicketVolumeChartConfig[
                    ProductsPerTicketColumn.TicketVolume
                ].hint
            }
            className={css.card}
            noPadding={true}
        >
            <TicketVolumeTable />
        </ChartCard>
    )
}
