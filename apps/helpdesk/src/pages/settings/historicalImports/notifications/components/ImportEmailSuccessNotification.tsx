import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { NotificationFeedItem, Subject } from '@repo/notifications'

import { Text } from '@gorgias/axiom'

import type { ContentProps, Notification } from 'common/notifications'
import { Content, Subtitle } from 'common/notifications'

import { getStartEndDate } from '../../utils'
import type { ImportNotification } from '../types'

import css from './ImportEmailNotifications.less'

type Props = {
    notification: Notification<ImportNotification>
} & ContentProps

const ImportEmailSuccessNotification = ({
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
        logEvent(SegmentEvent.SuccessfulEmailImportNotification, {
            importId: importNotification.id,
        })
    }

    if (hasWayfindingMS1Flag) {
        return (
            <NotificationFeedItem
                notification={notification}
                icon="comm-mail"
                title="Email history imported"
                to="#"
                onClick={handleOnClick}
            >
                <Text>
                    We&apos;ve successfully imported emails from{' '}
                    <Subject>{importNotification.provider_identifier}</Subject>{' '}
                    between{' '}
                    <Subject>
                        {startDate} and {endDate}
                    </Subject>{' '}
                    to your tickets.
                </Text>
            </NotificationFeedItem>
        )
    }

    return (
        <Content
            {...props}
            icon={{ type: 'email' }}
            title="Email history imported"
            url="#"
            onClick={handleOnClick}
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
