import * as actions from '../actions/activity'
import {Map, List, fromJS} from 'immutable'

const activityInitial = Map({
    events: List(),
    // Count how many new events since we visited the ticket. Ex: 999: {count: 0, created_datetime: 'now'}
    objectsCounter: Map(),
    pendingEvents: List() // events to be sent to the server
})

export function activity(state = activityInitial, action) {
    switch (action.type) {
        case actions.SUBMIT_ACTIVITY_SUCCESS: {
            // sort by created_datetime the events that come from the API
            const events = fromJS(action.resp.events).sort((a, b) => (
                new Date(b.get('created_datetime')) - new Date(a.get('created_datetime'))
            ))
            let objectsCounter = state.get('objectsCounter')

            // set the objectCounter
            if (state.get('objectsCounter').isEmpty()) {
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
                    // increase the counter if the datetime of the event for the same object differs from the
                    // previous state.
                    // Note: this has the drawback of missing some counts. For example when a lot of events are
                    //       added really fast only the last one is taken into account
                    if (counter && counter.get('created_datetime') !== e.created_datetime) {
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

            return state.merge({
                // clean the pending events that we've sent in the action
                pendingEvents: activityInitial.get('pendingEvents'),
                events,
                objectsCounter
            })
        }
        case actions.TICKET_VIEWED: {
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
