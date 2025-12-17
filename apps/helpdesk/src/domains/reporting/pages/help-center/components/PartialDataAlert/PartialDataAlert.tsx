import { DateAndTimeFormatting, formatDatetime } from '@repo/utils'

import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'

type PartialDataAlertProps = {
    collectionStartDate: string
}

const PartialDataAlert = ({ collectionStartDate }: PartialDataAlertProps) => {
    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.LongDateWithYear,
    )
    return (
        <Alert type={AlertType.Info} icon>
            There is only partial or no data available because we started
            collecting data from{' '}
            {formatDatetime(collectionStartDate, datetimeFormat)}.
        </Alert>
    )
}

export default PartialDataAlert
