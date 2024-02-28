import {queryCache} from 'api/queryClient'
import {store} from 'common/store'
import {voiceCallsKeys} from 'models/voiceCall/queries'
import {updateQueryTimestamp} from 'state/queries/actions'

jest.mock('api/queryClient', () => ({
    queryCache: {
        subscribe: jest.fn(),
    },
}))

jest.mock('common/store', () => ({
    store: {
        dispatch: jest.fn(),
    },
}))

jest.mock('state/queries/actions', () => ({
    updateQueryTimestamp: jest.fn(),
}))

const updateQueryTimestampMock = updateQueryTimestamp as jest.Mock

describe('initQueryClient', () => {
    beforeEach(() => {
        updateQueryTimestampMock.mockReturnValue({type: 'updateQueryTimestamp'})
    })

    it('should update query timestamp when query cache updates for subscribed query keys', () => {
        require('../initQueryClient')
        expect(queryCache.subscribe).toHaveBeenCalledWith(expect.any(Function))

        const [[subscribe]] = (queryCache.subscribe as jest.Mock).mock.calls
        const subscribedQueryEvent = {
            query: {queryKey: [voiceCallsKeys.all()[0]]},
            type: 'added',
        }

        ;(subscribe as (e: typeof subscribedQueryEvent) => void)(
            subscribedQueryEvent
        )

        expect(updateQueryTimestampMock).toHaveBeenCalledWith(
            voiceCallsKeys.all()
        )
        expect(store.dispatch).toHaveBeenCalledWith({
            type: 'updateQueryTimestamp',
        })

        const unsubscribedQueryEvent = {
            query: {queryKey: ['non-subscribed-query-key']},
            type: 'added',
        }
        ;(subscribe as (e: typeof unsubscribedQueryEvent) => void)(
            unsubscribedQueryEvent
        )
        expect(updateQueryTimestampMock).not.toHaveBeenCalledWith(
            unsubscribedQueryEvent.query.queryKey
        )
    })
})
