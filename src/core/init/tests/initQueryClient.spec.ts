import {queryCache} from 'api/queryClient'
import {store} from 'common/store'
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

    it('should update query timestamp when query cache updates', () => {
        require('../initQueryClient')
        expect(queryCache.subscribe).toHaveBeenCalledWith(expect.any(Function))

        const [[subscribe]] = (queryCache.subscribe as jest.Mock).mock.calls
        const event = {
            query: {queryKey: 'test'},
            type: 'added',
        }

        ;(subscribe as (e: typeof event) => void)(event)

        expect(updateQueryTimestampMock).toHaveBeenCalledWith('test')
        expect(store.dispatch).toHaveBeenCalledWith({
            type: 'updateQueryTimestamp',
        })
    })
})
