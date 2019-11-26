import {buildJobMessage} from '../notificationUtils'
import {APPLY_MACRO_JOB_TYPE, UPDATE_TICKET_JOB_TYPE, EXPORT_TICKET_JOB_TYPE} from '../../constants/job'


describe('Notification utils', () => {
    describe('buildActionNotificationMessage()', () => {
        it('Should return the message for a assignee update', () => {
            expect(buildJobMessage(UPDATE_TICKET_JOB_TYPE, true, 'tickets', {
                'updates': {
                    'assignee_user': {'name': 'John Snow'}
                }
            })
            ).toMatchSnapshot()
        })

        it('Should return the message for a status update', () => {
            expect(buildJobMessage(UPDATE_TICKET_JOB_TYPE, false, 'tickets', {
                'updates': {
                    'status': 'open'
                }
            }, 12)).toMatchSnapshot()
        })

        it('Should return the message for one tag update', () => {
            expect(buildJobMessage(UPDATE_TICKET_JOB_TYPE, false, 'ticket', {
                'updates': {
                    'tags': ['Awesome Tag']
                }
            }, 1)).toMatchSnapshot()
        })

        it('Should return the message for multiple tags update', () => {
            expect(buildJobMessage(UPDATE_TICKET_JOB_TYPE, true, 'ticket', {
                'updates': {
                    'tags': ['Tag one', 'Tag two']
                }
            })).toMatchSnapshot()
        })

        it('Should return the message for priority update', () => {
            expect(buildJobMessage(UPDATE_TICKET_JOB_TYPE, false, 'tickets', {
                'updates': {
                    'priority': 'normal'
                }
            }, 30)).toMatchSnapshot()
        })

        it('Should return the message for when we trash an item', () => {
            expect(buildJobMessage(UPDATE_TICKET_JOB_TYPE, true, 'tickets', {
                'updates': {
                    'trashed_datetime': '2018-01-01T14:00:00'
                }
            })).toMatchSnapshot()
        })

        it('Should return the message for when we untrash an item', () => {
            expect(buildJobMessage(UPDATE_TICKET_JOB_TYPE, true, 'tickets', {
                'updates': {
                    'trashed_datetime': null
                }
            })).toMatchSnapshot()
        })

        it('Should return the message for unhandled update', () => {
            expect(buildJobMessage(UPDATE_TICKET_JOB_TYPE, false, 'tickets', {
                'updates': {
                    'non_handled_key': 1
                }
            }, 12)).toMatchSnapshot()
        })

        it('Should return the message for multiple updates', () => {
            expect(buildJobMessage(UPDATE_TICKET_JOB_TYPE, true, 'tickets', {
                'updates': {
                    'status': 'open',
                    'subject': 'new subject'
                }
            })).toMatchSnapshot()
        })

        it('Should return the message for an apply macro action that also close items', () => {
            expect(buildJobMessage(APPLY_MACRO_JOB_TYPE, false, 'tickets',{
                'macro_id': 1,
                'apply_and_close': true
            }, 15)).toMatchSnapshot()
        })

        it('Should return the message for an apply macro action that don\'t close the items', () => {
            expect(buildJobMessage(APPLY_MACRO_JOB_TYPE, false, 'tickets', {
                'macro_id': 1,
                'apply_and_close': false
            }, 15)).toMatchSnapshot()
        })

        it('Should return the message for an unknown action', () => {
            expect(buildJobMessage(UPDATE_TICKET_JOB_TYPE, true, 'tickets', {
                'random_key': {}
            })).toMatchSnapshot()
        })

        it('Should return the message for an export tickets job', () => {
            expect(buildJobMessage(EXPORT_TICKET_JOB_TYPE, true, 'tickets', {})
            ).toMatchSnapshot()
        })

        it('Should return the message for an unknow job type', () => {
            expect(buildJobMessage('FAKE_JOB_TYPE', false, 'customers',
                {}, 30)).toMatchSnapshot()
        })
    })
})
