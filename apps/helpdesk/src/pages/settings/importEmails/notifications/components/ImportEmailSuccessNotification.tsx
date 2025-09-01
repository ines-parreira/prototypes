import type { ContentProps, Notification } from 'common/notifications'
import { Content, Subtitle } from 'common/notifications'
import { logEvent, SegmentEvent } from 'common/segment'

import { getStartEndDate } from '../../utils'
import { ImportNotification } from '../types'

import css from './ImportEmailNotifications.less'

type Props = {
    notification: Notification<ImportNotification>
} & ContentProps

const ImportEmailSuccessNotification = ({
    notification,
    onClick,
    ...props
}: Props) => {
    const { import: importNotification } = notification.payload

    if (!importNotification) return

    const { startDate, endDate } = getStartEndDate(
        importNotification.import_window_start,
        importNotification.import_window_end,
    )

    return (
        <Content
            {...props}
            icon={{ type: 'email' }}
            title="Email history imported"
            url="#"
            onClick={() => {
                onClick?.()
                logEvent(SegmentEvent.SuccessfulEmailImportNotification, {
                    importId: importNotification.id,
                })
            }}
        >
            <Subtitle>
                We’ve successfully imported emails from{' '}
                <span className={css.textBold}>
                    {importNotification.provider_identifier}{' '}
                </span>{' '}
                between{' '}
                <span className={css.textBold}>
                    {startDate} and {endDate}{' '}
                </span>{' '}
                to your tickets.
            </Subtitle>
        </Content>
    )
}

export default ImportEmailSuccessNotification
