import * as types from './constants'
import {Map, fromJS} from 'immutable'

const initialState = fromJS({
    events: [],
    // Count how many new events since we visited the ticket. Ex: 999: {count: 0, created_datetime: 'now'}
    objectsCounter: {},
    finished: true, // whenever the post has activity finished
    pendingEvents: [], // events to be sent to the server

    git_commit: '',
    newVersion: false
})

export default (state = initialState, action) => {
    switch (action.type) {
        case types.SUBMIT_ACTIVITY_START:
            return state.set('finished', false)

        case types.SUBMIT_ACTIVITY_ERROR:
            return state.set('finished', true)

        case types.SUBMIT_ACTIVITY_SUCCESS: {
            // sort by created_datetime the events that come from the API
            const events = fromJS(action.resp.events).sort((a, b) => (
                new Date(b.get('created_datetime')) - new Date(a.get('created_datetime'))
            ))

            let objectsCounter = state.get('objectsCounter')
            if (state.get('events').isEmpty()) {
                // set objectsCounter to 0 by default
                for (const e of events.toJS()) {
                    objectsCounter = objectsCounter.set(e.object_id, Map({
                        count: 0,
                        created_datetime: e.created_datetime
                    }))
                }
            } else {
                // we have a previous state, which means that we should recalculate the counter
                for (const e of events.toJS()) {
                    const counter = objectsCounter.get(e.object_id)
                    // ticket-viewed events should not increase the counter
                    if (e.type === 'ticket-viewed') {
                        continue
                    }

                    if (!counter) {
                        // if we haven't seen this object before set it with 1 counter
                        objectsCounter = objectsCounter.set(e.object_id, Map({
                            count: 1,
                            created_datetime: e.created_datetime
                        }))
                    } else if (counter.get('created_datetime') && counter.get('created_datetime') !== e.created_datetime) {
                        // increase the counter if the datetime of the event for the same object differs from the
                        // previous state.
                        // Note: this has the drawback of missing some counts. For example when a lot of events are
                        //       added really fast only the last one is taken into account

                        let count = counter.get('count') + 1
                        // if we are already on the ticket, then just reset the counter
                        if (window.location.pathname === `/app/ticket/${e.object_id}`) {
                            count = 0
                        }
                        objectsCounter = objectsCounter.set(e.object_id, Map({
                            count,
                            created_datetime: e.created_datetime
                        }))
                    }
                }
            }

            // see if the latest git_commit is different
            const newVersion = (action.resp.git_commit !== '' && action.resp.git_commit !== state.get('git_commit'))

            return state.merge({
                // clean the pending events that we've sent in the action
                pendingEvents: initialState.get('pendingEvents'),
                finished: true,
                events,
                objectsCounter,
                newVersion
            })
        }
        case types.TICKET_VIEWED: {
            const objectId = parseInt(action.ticketId, 10)

            // Collect the pending viewed events to be sent to the server
            const pendingEvents = state.get('pendingEvents').push(Map({
                type: 'ticket-viewed',
                object_type: 'Ticket',
                object_id: objectId
            }))

            // and reset the counter for this ticket because we just viewed it
            let objectsCounter = state.get('objectsCounter')
            let objCount = objectsCounter.get(objectId)
            if (!objCount) {
                objCount = Map({})
            }
            objectsCounter = objectsCounter.set(objectId, objCount.merge({count: 0}))

            return state.merge({
                pendingEvents,
                objectsCounter
            })
        }

        default:
            return state
    }
}
