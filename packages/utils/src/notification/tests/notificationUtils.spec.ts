import { JobType } from '@gorgias/helpdesk-types'

import { buildJobMessage } from '../notificationUtils'

describe('Notification utils', () => {
    describe('buildActionNotificationMessage()', () => {
        it('Should return the message for a assignee update', () => {
            expect(
                buildJobMessage(JobType.UpdateTicket, true, 'tickets', {
                    updates: {
                        assignee_user: { name: 'John Snow' },
                    },
                }),
            ).toBe(
                'All the tickets in this view will be assigned to John Snow.',
            )
        })

        it('Should return the message for a status update', () => {
            expect(
                buildJobMessage(
                    JobType.UpdateTicket,
                    false,
                    'tickets',
                    {
                        updates: {
                            status: 'open',
                        },
                    },
                    12,
                ),
            ).toBe('12 tickets will be marked as open in a few seconds.')
        })

        it('Should return the message for one tag update', () => {
            expect(
                buildJobMessage(
                    JobType.UpdateTicket,
                    false,
                    'ticket',
                    {
                        updates: {
                            tags: ['Awesome Tag'],
                        },
                    },
                    1,
                ),
            ).toBe(
                '1 ticket will be tagged with the "Awesome Tag" tag in a few seconds.',
            )
        })

        it('Should return the message for multiple tags update', () => {
            expect(
                buildJobMessage(JobType.UpdateTicket, true, 'ticket', {
                    updates: {
                        tags: ['Tag one', 'Tag two'],
                    },
                }),
            ).toBe('All the ticket in this view will be tagged with 2 tags.')
        })

        it('Should return the message for priority update', () => {
            expect(
                buildJobMessage(
                    JobType.UpdateTicket,
                    false,
                    'tickets',
                    {
                        updates: {
                            priority: 'normal',
                        },
                    },
                    30,
                ),
            ).toBe(
                '30 tickets will be marked as normal priority in a few seconds.',
            )
        })

        it('Should return the message for when we trash an item', () => {
            expect(
                buildJobMessage(JobType.UpdateTicket, true, 'tickets', {
                    updates: {
                        trashed_datetime: '2018-01-01T14:00:00',
                    },
                }),
            ).toBe('All the tickets in this view will be moved to the trash.')
        })

        it('Should return the message for when we untrash an item', () => {
            expect(
                buildJobMessage(JobType.UpdateTicket, true, 'tickets', {
                    updates: {
                        trashed_datetime: null,
                    },
                }),
            ).toBe('All the tickets in this view will be un-trashed.')
        })

        it('Should return the message for unhandled update', () => {
            expect(
                buildJobMessage(
                    JobType.UpdateTicket,
                    false,
                    'tickets',
                    {
                        updates: {
                            non_handled_key: 1,
                        },
                    },
                    12,
                ),
            ).toBe('12 tickets will be updated in a few seconds.')
        })

        it('Should return the message for multiple updates', () => {
            expect(
                buildJobMessage(JobType.UpdateTicket, true, 'tickets', {
                    updates: {
                        status: 'open',
                        subject: 'new subject',
                    },
                }),
            ).toBe('All the tickets in this view will be updated.')
        })

        it('Should return the message for an apply macro action that also close items', () => {
            expect(
                buildJobMessage(
                    JobType.ApplyMacro,
                    false,
                    'tickets',
                    {
                        macro_id: 1,
                        apply_and_close: true,
                    },
                    15,
                ),
            ).toBe(
                '15 tickets will be updated with the macro and closed in a few seconds.',
            )
        })

        it("Should return the message for an apply macro action that don't close the items", () => {
            expect(
                buildJobMessage(
                    JobType.ApplyMacro,
                    false,
                    'tickets',
                    {
                        macro_id: 1,
                        apply_and_close: false,
                    },
                    15,
                ),
            ).toBe(
                '15 tickets will be updated with the macro in a few seconds.',
            )
        })

        it('Should return the message for an unknown action', () => {
            expect(
                buildJobMessage(JobType.UpdateTicket, true, 'tickets', {
                    random_key: {},
                }),
            ).toBe('All the tickets in this view will be updated.')
        })

        it('Should return the message for an export tickets job', () => {
            expect(
                buildJobMessage(JobType.ExportTicket, true, 'tickets', {}),
            ).toBe(
                'All the tickets in this view will be exported. You will receive the download link via email once the export is done.',
            )
        })

        it('Should return the message for an unknow job type', () => {
            expect(
                buildJobMessage('FAKE_JOB_TYPE', false, 'customers', {}, 30),
            ).toBe('30 customers will be updated in a few seconds.')
        })
    })
})
