import {
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import createMockStore from 'redux-mock-store'
import {SenderVerification} from 'models/singleSenderVerification/types'
import {
    checkVerification,
    resendVerificationEmail,
} from 'models/singleSenderVerification/resources'
import {RootState, StoreDispatch} from 'state/types'
import VerificationEmailSent from '../SingleSenderVerification/VerificationEmailSent'

jest.mock('models/singleSenderVerification/resources')

const mockStore = createMockStore<RootState, StoreDispatch>()
const store = mockStore({} as RootState)

const emailAddress = 'sendgrid@gorgias.io'

const mockVerification: Partial<SenderVerification> = {
    address: 'Mock Address',
    email: emailAddress,
    city: 'San Francisco',
    country: 'United States',
}

describe('VerificationEmailSent', () => {
    afterEach(() => {
        jest.resetAllMocks()
    })

    beforeEach(() => {
        render(
            <Provider store={store}>
                <VerificationEmailSent
                    baseURL={'VerificationEmailSentMockUrl'}
                    verification={mockVerification as SenderVerification}
                    isDeleteInProgress={false}
                    onConfirmDeleteVerification={onConfirmDeleteVerification}
                    onVerificationUpdate={onVerificationUpdate}
                />
            </Provider>
        )
    })

    const onConfirmDeleteVerification = jest.fn()
    const onVerificationUpdate = jest.fn()

    it('Should call check verification endpoint', async () => {
        fireEvent.click(
            screen.getByRole('button', {
                name: /confirm verification/i,
            })
        )
        await waitFor(() => {
            expect(checkVerification).toHaveBeenCalled()
            expect(onVerificationUpdate).toHaveBeenCalled()
        })
    })

    it('Should call check re-send verification endpoint', async () => {
        fireEvent.click(
            screen.getByRole('button', {
                name: /re\-send verification email/i,
            })
        )
        await waitFor(() => {
            expect(resendVerificationEmail).toHaveBeenCalled()
        })
    })

    it('Should call "delete verification" endpoint', async () => {
        fireEvent.click(
            await screen.findByRole('button', {
                name: /delete delete verification/i,
            })
        )
        const tooltip = screen.getByRole('tooltip')

        fireEvent.click(
            within(tooltip).getByRole('button', {
                name: /confirm/i,
            })
        )

        await waitFor(() => {
            expect(onConfirmDeleteVerification).toHaveBeenCalled()
        })
    })
})
