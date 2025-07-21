import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { handleError } from '../errorHandler'

const mockedDispatch = jest.fn()

jest.mock('state/notifications/actions')

describe('handleError', () => {
    it('should dispatch the provided error message', () => {
        const message = 'test error'
        handleError(
            {
                response: { data: { error: { msg: message } } },
                isAxiosError: true,
            },
            '',
            mockedDispatch,
        )
        expect(notify).toHaveBeenNthCalledWith(1, {
            message,
            status: NotificationStatus.Error,
        })
        expect(mockedDispatch).toHaveBeenCalledTimes(1)
    })

    it('should dispatch default error message', () => {
        const message = 'default message'
        handleError(
            {
                response: undefined,
            },
            message,
            mockedDispatch,
        )
        expect(notify).toHaveBeenNthCalledWith(1, {
            message,
            status: NotificationStatus.Error,
            allowHTML: true,
        })
        expect(mockedDispatch).toHaveBeenCalledTimes(1)
    })

    it('should dispatch default error message with title', () => {
        const message = 'default message'
        const title = 'title'

        handleError(
            {
                response: undefined,
            },
            message,
            mockedDispatch,
            title,
        )
        expect(notify).toHaveBeenNthCalledWith(1, {
            message,
            status: NotificationStatus.Error,
            title,
            allowHTML: true,
        })
        expect(mockedDispatch).toHaveBeenCalledTimes(1)
    })
})
