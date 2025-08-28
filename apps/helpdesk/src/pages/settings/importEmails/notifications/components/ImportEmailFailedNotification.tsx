import moment from 'moment/moment'

import type { ContentProps, Notification } from 'common/notifications'
import { Content, Subtitle } from 'common/notifications'
import { logEvent, SegmentEvent } from 'common/segment'

import { ERROR_ICON } from '../../../../common/components/SourceIcon'
import { ImportNotification } from '../types'

import css from './ImportEmailNotifications.less'

type Props = {
    notification: Notification<ImportNotification>
} & ContentProps

const ImportEmailFailedNotification = ({
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
            icon={{ type: ERROR_ICON }}
            title="Email import failed"
            url={'#'}
            onClick={() => {
                onClick?.()
                logEvent(SegmentEvent.FailedEmailImportNotification, {
                    importId: importNotification.id,
                })
            }}
        >
            <Subtitle>
                We couldn’t complete the import of historical emails for{' '}
                <span className={css.textBold}>
                    {importNotification.provider_identifier}{' '}
                </span>
                between{' '}
                <span className={css.textBold}>
                    {startDate.toLocaleString()} and {endDate.toLocaleString()}
                    .{' '}
                </span>
                Please try again later.
            </Subtitle>
        </Content>
    )
}

export default ImportEmailFailedNotification
