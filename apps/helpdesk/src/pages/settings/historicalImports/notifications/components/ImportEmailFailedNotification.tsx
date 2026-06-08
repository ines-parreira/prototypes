import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { NotificationFeedItem, Subject } from '@repo/notifications'

import { Icon } from '@gorgias/axiom'

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
    const hasWayfindingMS1Flag = useHelpdeskV2WayfindingMS1Flag()
    const { import: importNotification } = notification.payload

    if (!importNotification) return null

    const { startDate, endDate } = getStartEndDate(
        importNotification.import_window_start,
        importNotification.import_window_end,
    )

    const handleOnClick = () => {
        onClick?.()
        logEvent(SegmentEvent.FailedEmailImportNotification, {
            importId: importNotification.id,
        })
    }

    if (hasWayfindingMS1Flag) {
        return (
            <NotificationFeedItem
                notification={notification}
                icon={<Icon name="error-octagon" color="red" />}
                title="Email import failed"
                href="#"
                onClick={handleOnClick}
            >
                <>
                    We couldn&apos;t complete the import of historical emails
                    for{' '}
                    <Subject>{importNotification.provider_identifier}</Subject>{' '}
                    between{' '}
                    <Subject>
                        {startDate.toLocaleString()} and{' '}
                        {endDate.toLocaleString()}.
                    </Subject>{' '}
                    Please try again later.
                </>
            </NotificationFeedItem>
        )
    }

    return (
        <Content
            {...props}
            icon={{ type: ERROR_ICON }}
            title="Email import failed"
            url="#"
            onClick={handleOnClick}
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
