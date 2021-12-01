import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS, Map} from 'immutable'

import * as userFixtures from '../../../fixtures/users'
import {initialState as currentUserInitialState} from '../../currentUser/reducers'
import {RootState} from '../../types'
import * as selectors from '../selectors'

jest.addMatchers(immutableMatchers)

describe('users audit selectors', () => {
    let state: RootState

    beforeEach(() => {
        window.GORGIAS_CONSTANTS = {
            USER_AUDIT_OBJECTS_EVENTS: {
                Integration: {
                    events: ['integration-created', 'integration-updated'],
                },
                Macro: {events: ['macro-created']},
            },
        }
        state = {
            currentUser: currentUserInitialState.mergeDeep(
                (fromJS(userFixtures.user) as Map<any, any>).set('id', 2)
            ),
            usersAudit: fromJS({
                events: [
                    {
                        id: 12,
                        object_type: 'Ticket',
                        object_id: 123,
                        type: 'ticket-created',
                        user_id: 123,
                    },
                    {
                        id: 12,
                        object_type: 'Ticket',
                        object_id: 123,
                        type: 'ticket-updated',
                        user_id: 123,
                    },
                ],
                meta: {
                    nb_pages: 123,
                    page: 1,
                },
            }),
            agents: fromJS({
                all: [{id: 1}, {id: 2}],
            }),
        } as RootState
    })

    it('getUserAuditEvents', () => {
        expect(selectors.getUserAuditEvents({} as RootState)).toEqualImmutable(
            fromJS([])
        )
        expect(selectors.getUserAuditEvents(state)).toEqualImmutable(
            state.usersAudit.get('events')
        )
    })

    it('getUserAuditPagination', () => {
        expect(
            selectors.getUserAuditPagination({} as RootState)
        ).toEqualImmutable(fromJS({}))
        expect(selectors.getUserAuditPagination(state)).toEqualImmutable(
            state.usersAudit.get('meta')
        )
    })

    it('getUserAuditUserIdOptions', () => {
        expect(
            selectors.getUserAuditUserIdOptions({} as RootState)
        ).toEqualImmutable(fromJS([]))
        expect(
            fromJS(selectors.getUserAuditUserIdOptions(state).toJS())
        ).toEqualImmutable(
            fromJS([
                {label: '', value: 1},
                {label: '', value: 2},
            ])
        )
    })

    it('getUserAuditObjectsEvents', () => {
        expect(
            selectors.getUserAuditObjectsEvents({} as RootState)
        ).toEqualImmutable(
            fromJS(window.GORGIAS_CONSTANTS.USER_AUDIT_OBJECTS_EVENTS)
        )
    })

    it('getUserAuditObjectTypeOptions', () => {
        expect(
            fromJS(
                selectors.getUserAuditObjectTypeOptions({} as RootState).toJS()
            )
        ).toEqualImmutable(
            fromJS([
                {label: 'Integration', value: 'Integration'},
                {label: 'Macro', value: 'Macro'},
            ])
        )
    })

    it('getUserAuditEventTypeOptions', () => {
        expect(
            fromJS(
                selectors.getUserAuditEventTypeOptions({} as RootState).toJS()
            )
        ).toEqualImmutable(
            fromJS([
                {label: 'Integration created', value: 'integration-created'},
                {label: 'Integration updated', value: 'integration-updated'},
                {label: 'Macro created', value: 'macro-created'},
            ])
        )
    })
})
