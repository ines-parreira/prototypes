import type { ComponentProps } from 'react'
import React from 'react'

import { AlertBannerTypes } from 'AlertBanners'
import type { AlertBanner } from 'AlertBanners/components/AlertBanner'
import type { EmailMigrationBannerStatus } from 'models/integration/types'
import { getMoment, stringToDatetime } from 'utils/date'

export const computeEmailMigrationStatusBanner = (
    migration: EmailMigrationBannerStatus,
    onCTAClick: () => void,
): ComponentProps<typeof AlertBanner> | null => {
    const now = getMoment()
    const dueDate = stringToDatetime(migration.due_at ?? '')

    if (!migration.status || !dueDate) return null

    const formattedDueDate = dueDate.format('dddd, MMM D, YYYY')
    const startDate = stringToDatetime(migration.started_at ?? '')
    const daysLeft = dueDate.diff(now, 'days')
    let bannerStatus: AlertBannerTypes
    let message: string

    const getCTA = (text: string) => ({
        type: 'action' as const,
        text,
        onClick: onCTAClick,
    })

    if (now.isSameOrAfter(dueDate)) {
        return {
            CTA: getCTA(startDate ? 'Finish Migration' : 'Start Migration'),
            message: (
                <>
                    <strong>Deadline missed:</strong> Please migrate your email
                    integrations to our new provider to continue sending and
                    receiving emails uninterrupted.
                </>
            ),
            type: AlertBannerTypes.Critical,
        }
    }

    const CTA = getCTA(startDate ? 'Continue Migration' : 'Start Migration')

    if (daysLeft > 14) {
        bannerStatus = AlertBannerTypes.Info
        message = `We're moving to a new email provider to improve stability.`
    } else if (daysLeft > 7) {
        bannerStatus = AlertBannerTypes.Warning
        message = `You have <strong>less than 2 weeks</strong> left to migrate to our new email provider.`
    } else {
        bannerStatus = AlertBannerTypes.Critical
        message = `You have <strong>less than 1 week</strong> to migrate to our new email provider.`
    }

    return {
        type: bannerStatus,
        message: `<strong>Action required:</strong> ${message} <strong>Migrate your email integrations over by ${formattedDueDate}</strong> or risk losing service.`,
        CTA,
    }
}
