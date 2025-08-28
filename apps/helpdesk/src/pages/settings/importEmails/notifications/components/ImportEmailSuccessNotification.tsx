import moment from 'moment/moment'

import type { ContentProps, Notification } from 'common/notifications'
import { Content, Subtitle } from 'common/notifications'
import { logEvent, SegmentEvent } from 'common/segment'

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

    const startDate = moment(importNotification.import_window_start).format(
        'MMM D, YYYY',
    )
    const endDate = moment(importNotification.import_window_end).format(
        'MMM D, YYYY',
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
