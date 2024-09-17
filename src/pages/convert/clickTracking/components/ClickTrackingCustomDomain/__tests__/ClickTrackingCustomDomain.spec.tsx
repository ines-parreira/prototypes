import React from 'react'
import {
    fireEvent,
    render,
    waitForElementToBeRemoved,
    waitFor,
    screen,
} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {RootState, StoreDispatch} from 'state/types'

import {ClickTrackingCustomDomain} from '../ClickTrackingCustomDomain'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const store = mockStore({})

const ReduxProvider = ({children}: {children?: React.ReactNode}) => (
    <Provider store={store}>{children}</Provider>
)

jest.mock('pages/convert/common/hooks/useConvertApi', () => {
    return {
        useConvertApi: jest.fn().mockReturnValue({
            isReady: true,
            client: {
                get_custom_domain: () =>
                    Promise.resolve({
                        data: {},
                        status: 404,
                    }),
                delete_custom_domain: () =>
                    Promise.resolve({
                        data: {},
                        status: 204,
                    }),
                create_custom_domain: () =>
                    Promise.resolve({
                        data: {
                            hostname: 'example.com',
                            status: 'pending',
                        },
                        status: 201,
                    }),
                check_custom_domain: () =>
                    Promise.resolve({
                        data: {
                            hostname: 'example.com',
                            status: 'unknown',
                        },
                        status: 200,
                    }),
            },
        }),
    }
})

describe('<ClickTrackingCustomDomain />', () => {
    beforeEach(() => {
        store.clearActions()
    })

    const inputText = 'link.brand-name.com'

    it('has Add Domain button enabled if custom domain feature is enabled and input has value', async () => {
        render(<ClickTrackingCustomDomain />, {
            wrapper: ReduxProvider,
        })

        await waitFor(() => {
            expect(screen.getByPlaceholderText(inputText)).toBeInTheDocument()
        })

        const input: HTMLInputElement = screen.getByPlaceholderText(inputText)

        const addDomainBtn: HTMLInputElement = screen.getByText('Add Domain')

        fireEvent.change(input, {target: {value: 'example.com'}})

        expect(input.value).toEqual('example.com')
        expect(addDomainBtn.disabled).toBeFalsy()
    })

    it('adds a new domain', async () => {
        render(<ClickTrackingCustomDomain />, {wrapper: ReduxProvider})

        await waitFor(() => {
            expect(screen.getByPlaceholderText(inputText)).toBeInTheDocument()
        })

        const input = screen.queryByPlaceholderText(
            inputText
        ) as HTMLInputElement

        const addDomainBtn = screen.getByText('Add Domain')

        fireEvent.change(input, {target: {value: 'example.com'}})
        fireEvent.click(addDomainBtn)

        await screen.findByText('Verification in progress')
    })

    it('"Check Status" button updates the status of the connection', async () => {
        render(<ClickTrackingCustomDomain />, {wrapper: ReduxProvider})

        await waitFor(() => {
            expect(screen.getByPlaceholderText(inputText)).toBeInTheDocument()
        })

        const input = screen.queryByPlaceholderText(
            inputText
        ) as HTMLInputElement

        const addDomainBtn = screen.getByText('Add Domain')

        fireEvent.change(input, {target: {value: 'example.com'}})
        fireEvent.click(addDomainBtn)

        await screen.findByText('Verification in progress')

        const checkStatusBtn = screen.queryByText(
            'Check Status'
        ) as HTMLButtonElement

        fireEvent.click(checkStatusBtn)

        await screen.findByText('Validation error')
    })

    it('removes the connection status when deleting the domain', async () => {
        render(<ClickTrackingCustomDomain />, {wrapper: ReduxProvider})

        await waitFor(() => {
            expect(screen.getByPlaceholderText(inputText)).toBeInTheDocument()
        })

        const input = screen.getByPlaceholderText(inputText)
        const addDomainBtn = screen.getByText('Add Domain')

        fireEvent.change(input, {target: {value: 'example.com'}})
        fireEvent.click(addDomainBtn)

        await waitForElementToBeRemoved(() =>
            screen.getByText('Creating domain')
        )

        const deleteDomain = screen.getByLabelText('Delete custom domain')

        fireEvent.click(deleteDomain)

        const confirm_button = screen.getByRole('button', {
            name: /confirm/i,
        })

        fireEvent.click(confirm_button)

        await waitForElementToBeRemoved(() =>
            screen.getByTestId('connection-status')
        )
    })
})
