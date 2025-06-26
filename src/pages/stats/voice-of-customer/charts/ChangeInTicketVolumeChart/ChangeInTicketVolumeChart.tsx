import ChartCard from 'pages/stats/common/components/ChartCard'
import css from 'pages/stats/ticket-insights/ticket-fields/TicketDistributionTable.less'
import { ChangeInTicketVolumeChartConfig } from 'pages/stats/voice-of-customer/charts/ChangeInTicketVolumeChart/ticketVolumeConfig'
import { TicketVolumeTable } from 'pages/stats/voice-of-customer/charts/ChangeInTicketVolumeChart/TicketVolumeTable'
import { ProductsPerTicketColumn } from 'state/ui/stats/productsPerTicketSlice'

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
