import {AlertBannerTypes} from 'AlertBanners'
import {EmailMigrationStatus} from 'models/integration/types'
import * as dateUtils from 'utils/date'

import {computeEmailMigrationStatusBanner} from '../helpers'

describe('migration banner helpers', () => {
    describe('computeEmailMigrationStatusBanner', () => {
        jest.spyOn(dateUtils, 'getMoment').mockImplementation((): any =>
            dateUtils.stringToDatetime('2023-01-10T00:00')
        )

        it('should return null when status or due date are null', () => {
            const bannerSettings = computeEmailMigrationStatusBanner(
                {
                    status: null,
                    due_at: null,
                    started_at: null,
                },
                () => {}
            )
            expect(bannerSettings).toBeNull()
        })

        it('should display Start Migration in CTA', () => {
            const bannerSettings = computeEmailMigrationStatusBanner(
                {
                    status: EmailMigrationStatus.Enabled,
                    started_at: null,
                    due_at: '2023-01-31T00:00',
                },
                () => {}
            )

            expect(
                bannerSettings?.CTA?.text.includes('Start Migration')
            ).toBeTruthy()
            expect(
                bannerSettings?.CTA?.text.includes('Continue Migration')
            ).toBeFalsy()
        })

        it('should display Start Migration in CTA when migration is not started', () => {
            const bannerSettings = computeEmailMigrationStatusBanner(
                {
                    status: EmailMigrationStatus.Enabled,
                    started_at: '2023-01-02T00:00',
                    due_at: '2023-01-31T00:00',
                },
                () => {}
            )

            expect(
                bannerSettings?.CTA?.text.includes('Continue Migration')
            ).toBeTruthy()
            expect(
                bannerSettings?.CTA?.text.includes('Start Migration')
            ).toBeFalsy()
        })

        it('should display Continue Migration in CTA when migration is started but not completed', () => {
            const bannerSettings = computeEmailMigrationStatusBanner(
                {
                    status: EmailMigrationStatus.Enabled,
                    started_at: '2023-01-02T00:00',
                    due_at: '2023-01-31T00:00',
                },
                () => {}
            )

            expect(
                bannerSettings?.CTA?.text.includes('Continue Migration')
            ).toBeTruthy()
            expect(
                bannerSettings?.CTA?.text.includes('Start Migration')
            ).toBeFalsy()
        })

        it.each([
            {
                status: EmailMigrationStatus.Enabled,
                started_at: null,
                due_at: '2023-01-01T00:00',
            },
            {
                status: EmailMigrationStatus.Missed,
                started_at: null,
                due_at: '2023-01-01T00:00',
            },
            {
                status: EmailMigrationStatus.Missed,
                started_at: '2023-01-31T00:00',
                due_at: '2023-01-01T00:00',
            },
            {
                status: EmailMigrationStatus.Missed,
                started_at: '2023-01-01T00:00',
                due_at: '2023-01-10T00:00',
            },
            {
                status: EmailMigrationStatus.Pending,
                started_at: '2023-01-31T00:00',
                due_at: '2023-01-01T00:00',
            },
        ])(
            'should display deadline missed when it is past due date and migration is not complete',
            (migration) => {
                const bannerSettings = computeEmailMigrationStatusBanner(
                    {
                        status: migration.status,
                        started_at: migration.started_at,
                        due_at: migration.due_at,
                    },
                    () => {}
                )

                expect(bannerSettings?.message).toBe(
                    `<strong>Deadline missed:</strong> Please migrate your email integrations to our new provider to continue sending and receiving emails uninterrupted.`
                )
                expect(bannerSettings?.type).toBe(AlertBannerTypes.Critical)
            }
        )

        it('should display Finish Migration when it is past due date and migration is started', () => {
            const bannerSettings = computeEmailMigrationStatusBanner(
                {
                    status: EmailMigrationStatus.Missed,
                    started_at: '2023-01-31T00:00',
                    due_at: '2023-01-01T00:00',
                },
                () => {}
            )
            expect(
                bannerSettings?.CTA?.text.includes('Finish Migration')
            ).toBeTruthy()
        })

        it('should display Start Migration when it is past due date and migration is not started', () => {
            const bannerSettings = computeEmailMigrationStatusBanner(
                {
                    status: EmailMigrationStatus.Missed,
                    started_at: null,
                    due_at: '2023-01-01T00:00',
                },
                () => {}
            )
            expect(
                bannerSettings?.CTA?.text.includes('Start Migration')
            ).toBeTruthy()
        })

        it.each([
            {
                status: EmailMigrationStatus.Enabled,
                started_at: null,
            },
            {
                status: EmailMigrationStatus.Pending,
                started_at: '2023-01-01T00:00',
            },
        ])(
            `should display "we're moving to a new email provider" when there are more than 30 days left`,
            (migration) => {
                const bannerSettings = computeEmailMigrationStatusBanner(
                    {
                        status: migration.status,
                        started_at: migration.started_at,
                        due_at: '2023-02-20T00:00',
                    },
                    () => {}
                )

                expect(
                    (bannerSettings?.message as string).startsWith(
                        `<strong>Action required:</strong> We're moving to a new email provider to improve stability.`
                    )
                ).toBeTruthy()
                expect(bannerSettings?.type).toBe(AlertBannerTypes.Info)
            }
        )

        it.each([
            {
                status: EmailMigrationStatus.Enabled,
                started_at: null,
            },
            {
                status: EmailMigrationStatus.Pending,
                started_at: '2023-01-01T00:00',
            },
        ])(
            `should display "You have less than 2 weeks" when there are between 14 and 7 days left`,
            (migration) => {
                const bannerSettings = computeEmailMigrationStatusBanner(
                    {
                        status: migration.status,
                        started_at: migration.started_at,
                        due_at: '2023-01-18T00:00',
                    },
                    () => {}
                )

                expect(
                    (bannerSettings?.message as string).startsWith(
                        `<strong>Action required:</strong> You have <strong>less than 2 weeks</strong> left to migrate to our new email provider.`
                    )
                ).toBeTruthy()
                expect(bannerSettings?.type).toBe(AlertBannerTypes.Warning)
            }
        )

        it.each([
            {
                status: EmailMigrationStatus.Enabled,
                started_at: null,
            },
            {
                status: EmailMigrationStatus.Pending,
                started_at: '2023-01-01T00:00',
            },
        ])(
            `should display "You have less than 1 week" when there are between 0 and 7 days left`,
            (migration) => {
                const bannerSettings = computeEmailMigrationStatusBanner(
                    {
                        status: migration.status,
                        started_at: migration.started_at,
                        due_at: '2023-01-15T00:00',
                    },
                    () => {}
                )

                expect(
                    (bannerSettings?.message as string).startsWith(
                        `<strong>Action required:</strong> You have <strong>less than 1 week</strong> to migrate to our new email provider.`
                    )
                ).toBeTruthy()
                expect(bannerSettings?.type).toBe(AlertBannerTypes.Critical)
            }
        )
    })
})
