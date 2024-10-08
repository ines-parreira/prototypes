import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {handleError} from '../errorHandler'

const mockedDispatch = jest.fn()

jest.mock('state/notifications/actions')

describe('handleError', () => {
    it('should dispatch the provided error message', () => {
        const message = 'test error'
        handleError(
            {
                response: {data: {message}},
                isAxiosError: true,
            },
            '',
            mockedDispatch
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
            mockedDispatch
        )
        expect(notify).toHaveBeenNthCalledWith(1, {
            message,
            status: NotificationStatus.Error,
        })
        expect(mockedDispatch).toHaveBeenCalledTimes(1)
    })

    it('should dispatch duplicate name error', () => {
        const message = 'default message'
        const error = {
            response: {status: 409},
            isAxiosError: true,
        }

        handleError(error, message, mockedDispatch)

        expect(notify).toHaveBeenNthCalledWith(1, {
            message:
                'An Action already exists with this name. Choose a unique name in order to create this Action.',
            status: NotificationStatus.Error,
        })
        expect(mockedDispatch).toHaveBeenCalledTimes(1)
    })
})
