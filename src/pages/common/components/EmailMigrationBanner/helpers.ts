import {EmailMigrationBannerStatus} from 'models/integration/types'
import {Notification, NotificationStatus} from 'state/notifications/types'
import {getMoment, stringToDatetime} from 'utils/date'

export const computeEmailMigrationStatusBanner = (
    migration: EmailMigrationBannerStatus
): Notification | null => {
    const now = getMoment()
    const dueDate = stringToDatetime(migration.due_at ?? '')

    if (!migration.status || !dueDate) return null

    const formattedDueDate = dueDate.format('dddd, MMM D, YYYY')
    const startDate = stringToDatetime(migration.started_at ?? '')
    const daysLeft = dueDate.diff(now, 'days')
    let bannerStatus: NotificationStatus
    let message: string

    const getActionHTML = (
        text: string
    ) => `<span class="d-inline-flex align-items-baseline">
    <span class="text-primary">${text}</span>
    </span>`

    if (now.isSameOrAfter(dueDate)) {
        return {
            actionHTML: getActionHTML(
                startDate ? 'Finish Migration' : 'Start Migration'
            ),
            message: `<strong>Deadline missed:</strong> Please migrate your email integrations to our new provider to continue sending and receiving emails uninterrupted.`,
            status: NotificationStatus.Error,
        }
    }

    const actionHTML = getActionHTML(
        startDate ? 'Continue Migration' : 'Start Migration'
    )

    if (daysLeft > 29) {
        bannerStatus = NotificationStatus.Info
        message = `We're moving to a new email provider to improve stability.`
    } else if (daysLeft > 7) {
        bannerStatus = NotificationStatus.Warning
        message = `You have <strong>less than 1 month</strong> left to migrate to our new email provider.`
    } else {
        bannerStatus = NotificationStatus.Error
        message = `You have <strong>less than 1 week</strong> to migrate to our new email provider.`
    }

    return {
        status: bannerStatus,
        message: `<strong>Action required:</strong> ${message} <strong>Migrate your email integrations over by ${formattedDueDate}</strong> or risk losing service.`,
        actionHTML,
    }
}
