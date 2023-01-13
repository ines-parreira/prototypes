import React from 'react'
import {
    fireEvent,
    render,
    waitForElementToBeRemoved,
    waitFor,
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

jest.mock('pages/settings/revenue/hooks/useClickTrackingApi', () => {
    return {
        useClickTrackingApi: jest.fn().mockReturnValue({
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
                            hostname: 'gorgias.win',
                            status: 'pending',
                        },
                        status: 201,
                    }),
                check_custom_domain: () =>
                    Promise.resolve({
                        data: {
                            hostname: 'gorgias.win',
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
        const {getByPlaceholderText, getByTestId} = render(
            <ClickTrackingCustomDomain />,
            {wrapper: ReduxProvider}
        )

        await waitFor(() => {
            expect(getByPlaceholderText(inputText)).toBeInTheDocument()
        })

        const input = getByPlaceholderText(inputText) as HTMLInputElement

        const addDomainBtn = getByTestId(
            'create-domain-btn'
        ) as HTMLButtonElement

        fireEvent.change(input, {target: {value: 'gorgias.win'}})

        expect(input.value).toEqual('gorgias.win')
        expect(addDomainBtn.disabled).toBeFalsy()
    })

    it('adds a new domain', async () => {
        const {
            queryByPlaceholderText,
            queryByTestId,
            findByText,
            getByPlaceholderText,
        } = render(<ClickTrackingCustomDomain />, {wrapper: ReduxProvider})

        await waitFor(() => {
            expect(getByPlaceholderText(inputText)).toBeInTheDocument()
        })

        const input = queryByPlaceholderText(inputText) as HTMLInputElement

        const addDomainBtn = queryByTestId(
            'create-domain-btn'
        ) as HTMLButtonElement

        fireEvent.change(input, {target: {value: 'gorgias.win'}})
        fireEvent.click(addDomainBtn)

        await findByText('Verification in progress')
    })

    it('"Check Status" button updates the status of the connection', async () => {
        const {
            queryByPlaceholderText,
            queryByTestId,
            findByText,
            queryByText,
            getByPlaceholderText,
        } = render(<ClickTrackingCustomDomain />, {wrapper: ReduxProvider})

        await waitFor(() => {
            expect(getByPlaceholderText(inputText)).toBeInTheDocument()
        })

        const input = queryByPlaceholderText(inputText) as HTMLInputElement

        const addDomainBtn = queryByTestId(
            'create-domain-btn'
        ) as HTMLButtonElement

        fireEvent.change(input, {target: {value: 'gorgias.win'}})
        fireEvent.click(addDomainBtn)

        await findByText('Verification in progress')

        const checkStatusBtn = queryByText('Check Status') as HTMLButtonElement

        fireEvent.click(checkStatusBtn)

        await findByText('Validation error')
    })

    it('removes the connection status when deleting the domain', async () => {
        const {getByPlaceholderText, getByTestId, getByRole} = render(
            <ClickTrackingCustomDomain />,
            {wrapper: ReduxProvider}
        )

        await waitFor(() => {
            expect(getByPlaceholderText(inputText)).toBeInTheDocument()
        })

        const input = getByPlaceholderText(inputText) as HTMLInputElement

        const addDomainBtn = getByTestId(
            'create-domain-btn'
        ) as HTMLButtonElement

        fireEvent.change(input, {target: {value: 'gorgias.win'}})
        fireEvent.click(addDomainBtn)

        await waitForElementToBeRemoved(() => getByTestId('create-domain-btn'))

        const deleteDomain = getByTestId(
            'delete-domain-btn'
        ) as HTMLButtonElement

        fireEvent.click(deleteDomain)

        const confirm_button = getByRole('button', {
            name: /confirm/i,
        }) as HTMLInputElement

        fireEvent.click(confirm_button)

        await waitForElementToBeRemoved(() => getByTestId('connection-status'))
    })
})
