import { logEvent, SegmentEvent } from '@repo/logging'

import type { ContentProps, Notification } from 'common/notifications'
import { Content, Subtitle } from 'common/notifications'

import { ERROR_ICON } from '../../../../common/components/SourceIcon'
import { getStartEndDate } from '../../utils'
import type { ImportNotification } from '../types'

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

    const { startDate, endDate } = getStartEndDate(
        importNotification.import_window_start,
        importNotification.import_window_end,
    )

    return (
        <Content
            {...props}
            icon={{ type: ERROR_ICON }}
            title="Email import failed"
            url="#"
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
