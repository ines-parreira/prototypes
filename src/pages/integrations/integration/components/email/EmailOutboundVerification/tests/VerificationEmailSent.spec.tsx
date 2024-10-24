import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import createMockStore from 'redux-mock-store'

import {EmailProvider} from 'models/integration/constants'
import {resendVerificationEmail} from 'models/singleSenderVerification/resources'
import {SenderVerification} from 'models/singleSenderVerification/types'
import {RootState, StoreDispatch} from 'state/types'

import VerificationEmailSent from '../SingleSenderVerification/VerificationEmailSent'

jest.mock('models/singleSenderVerification/resources')
jest.useFakeTimers()

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
    const onConfirmDeleteVerification = jest.fn()
    const onVerificationUpdate = jest.fn()
    const refetchVerification = jest.fn()

    afterEach(() => {
        jest.resetAllMocks()
    })

    beforeEach(() => {
        render(
            <Provider store={store}>
                <VerificationEmailSent
                    baseURL={'VerificationEmailSentMockUrl'}
                    verification={mockVerification as SenderVerification}
                    onConfirmDeleteVerification={onConfirmDeleteVerification}
                    onVerificationUpdate={onVerificationUpdate}
                    refetchVerification={refetchVerification}
                    provider={EmailProvider.Sendgrid}
                />
            </Provider>
        )
    })

    it('Should periodically call get verification endpoint', () => {
        act(() => {
            jest.runAllTimers()
        })

        expect(refetchVerification).toHaveBeenCalled()
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
