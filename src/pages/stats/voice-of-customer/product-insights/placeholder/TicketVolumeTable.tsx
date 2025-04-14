import { useWidthBasedOnScreen } from 'hooks/useWidthBasedOnScreen'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import { DistributionCategoryCell } from 'pages/stats/ticket-insights/components/DistributionCategoryCell'
import css from 'pages/stats/ticket-insights/tags/TopUsedTagsChart.less'

const useTicketVolumePerCustomField = (selectedCustomFieldId: number) => {
    return {
        topData: [
            {
                id: 123,
                customFieldId: selectedCustomFieldId,
                product: 'SonicWave Pro Noise Cancelling...',
                gaugePercentage: 90,
                value: 1987,
                valueInPercentage: 0.3,
            },
            {
                id: 124,
                customFieldId: selectedCustomFieldId,
                product: 'Echoblast Wireless Earbuds...',
                gaugePercentage: 90,
                value: 703,
                valueInPercentage: 0.1,
            },
            {
                id: 125,
                customFieldId: selectedCustomFieldId,
                product: 'Trek Sports Earbuds Water...',
                gaugePercentage: 80,
                value: 655,
                valueInPercentage: 0.1,
            },
            {
                id: 126,
                customFieldId: selectedCustomFieldId,
                product: 'Thunderbass',
                gaugePercentage: 70,
                value: 432,
                valueInPercentage: 0.08,
            },
            {
                id: 127,
                customFieldId: selectedCustomFieldId,
                product: 'Resonix Home Theat...',
                gaugePercentage: 60,
                value: 320,
                valueInPercentage: -0.08,
            },
            {
                id: 128,
                customFieldId: selectedCustomFieldId,
                product: 'Quietpod',
                gaugePercentage: 55,
                value: 298,
                valueInPercentage: 0.01,
            },
            {
                id: 129,
                customFieldId: selectedCustomFieldId,
                product: 'Clear Wave',
                gaugePercentage: 50,
                value: 230,
                valueInPercentage: 0.03,
            },
            {
                id: 130,
                customFieldId: selectedCustomFieldId,
                product: 'Resonate...',
                gaugePercentage: 45,
                value: 209,
                valueInPercentage: 0.01,
            },
            {
                id: 131,
                customFieldId: selectedCustomFieldId,
                product: 'Clear Wave...',
                gaugePercentage: 40,
                value: 143,
                valueInPercentage: 0.17,
            },
            {
                id: 132,
                customFieldId: selectedCustomFieldId,
                product: 'Quicksync...',
                gaugePercentage: 35,
                value: 111,
                valueInPercentage: 0.08,
            },
        ],
    }
}

export const HeaderRow = () => {
    return (
        <TableBodyRow>
            <BodyCell
                justifyContent="left"
                width={300}
                className={css.bodyCell}
            >
                Product
            </BodyCell>
            <BodyCell
                justifyContent="center"
                width={65}
                className={css.bodyCell}
            >
                Total
            </BodyCell>
            <BodyCell
                justifyContent="center"
                width={65}
                className={css.bodyCell}
            >
                Delta
            </BodyCell>
        </TableBodyRow>
    )
}

export const TicketVolumeTable = ({
    selectedCustomFieldId,
}: {
    selectedCustomFieldId: number
}) => {
    const getWidth = useWidthBasedOnScreen()

    const { topData } = useTicketVolumePerCustomField(selectedCustomFieldId)

    return (
        <TableWrapper className={css.table}>
            <TableBody>
                <HeaderRow />
                {topData.map((item, index) => (
                    <TableBodyRow key={index}>
                        <DistributionCategoryCell
                            key={item.id}
                            progress={item.gaugePercentage}
                            width={getWidth(320, 160)}
                            category={item.product}
                        />
                        <BodyCell justifyContent="right" width={80}>
                            <>
                                {formatMetricValue(
                                    item.value,
                                    'decimal',
                                    NOT_AVAILABLE_PLACEHOLDER,
                                )}
                            </>
                        </BodyCell>
                        <BodyCell justifyContent="right" width={80}>
                            {formatMetricValue(
                                item.valueInPercentage,
                                'percent-refined',
                                NOT_AVAILABLE_PLACEHOLDER,
                            )}
                        </BodyCell>
                    </TableBodyRow>
                ))}
            </TableBody>
        </TableWrapper>
    )
}
