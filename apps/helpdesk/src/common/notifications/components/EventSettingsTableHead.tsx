import css from 'common/notifications/components/EventSettings.less'
import { channels } from 'common/notifications/data'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import TableHead from 'pages/common/components/table/TableHead'

type EventSettingsTableHeadProps = {
    typeHeader: string
}
export default function EventSettingsTableHead({
    typeHeader,
}: EventSettingsTableHeadProps) {
    return (
        <TableHead>
            <HeaderCell className={css.headingCell}>{typeHeader}</HeaderCell>
            <HeaderCell className={css.headingCell}>Sound</HeaderCell>
            {channels.map((channel) => (
                <HeaderCell key={channel.type} className={css.headingCell}>
                    {channel.label}
                </HeaderCell>
            ))}
        </TableHead>
    )
}
