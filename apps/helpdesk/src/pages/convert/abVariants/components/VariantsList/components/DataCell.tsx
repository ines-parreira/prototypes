import { DateAndTimeFormatting, formatDatetime } from '@repo/utils'

import { Skeleton } from '@gorgias/axiom'

import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import { formatPercentage } from 'pages/common/utils/numbers'
import { ABGroupValueFormat } from 'pages/convert/abVariants/components/VariantsList/types'

type Props = {
    format: ABGroupValueFormat
    data: any
    isLoading?: boolean
}

const DataCell: React.FC<Props> = ({ format, data, isLoading = false }) => {
    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.CompactDate,
    )

    if (isLoading) {
        return (
            <div style={{ width: '100%' }}>
                <Skeleton count={1} width="100%" />
            </div>
        )
    }

    if (format === ABGroupValueFormat.Date) {
        return <>{data ? formatDatetime(data, datetimeFormat) : '-'}</>
    }

    if (format === ABGroupValueFormat.Percentage) {
        return <>{formatPercentage(data)}</>
    }

    return <>{data}</>
}

export default DataCell
