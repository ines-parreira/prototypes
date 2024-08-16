import React from 'react'

import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import {DateAndTimeFormatting} from 'constants/datetime'

import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import {ABGroupValueFormat} from 'pages/convert/abVariants/components/VariantsList/types'
import {formatPercentage} from 'pages/common/utils/numbers'

import {formatDatetime} from 'utils'

type Props = {
    format: ABGroupValueFormat
    data: any
    isLoading?: boolean
}

const DataCell: React.FC<Props> = ({format, data, isLoading = false}) => {
    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.CompactDate
    )

    if (isLoading) {
        return (
            <div style={{width: '100%'}}>
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
