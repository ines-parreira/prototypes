import React from 'react'

import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {useParams} from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import {
    render,
    screen,
    fireEvent,
    act,
    waitForElementToBeRemoved,
} from '@testing-library/react'

import {RootState, StoreDispatch} from '../../../../../../state/types'

import {CustomDomain} from '../CustomDomain'

jest.mock('react-router')
;(useParams as jest.MockedFunction<typeof useParams>).mockReturnValue({
    helpcenterId: '1',
})

jest.mock('../../../hooks/useHelpcenterApi', () => {
    return {
        useHelpcenterApi: jest.fn().mockReturnValue({
            isReady: true,
            client: {
                deleteCustomDomain: () =>
                    Promise.resolve({
                        data: {},
                        status: 200,
                    }),
                createCustomDomain: () =>
                    Promise.resolve({
                        data: {
                            hostname: 'gorgias.help',
                            help_center_id: 1,
                            deleted_datetime: null,
                            created_datetime: '2021-07-29T09:28:30.741Z',
                            updated_datetime: '2021-07-29T09:28:30.741Z',
                            id: 21,
                            status: 'pending',
                        },
                    }),
                listCustomDomains: () =>
                    Promise.resolve({
                        data: {
                            object: 'list',
                            data: [],
                            meta: {
                                page: 1,
                                per_page: 20,
                                current_page:
                                    '/help-centers/1/custom-domains?page=1&per_page=20',
                                item_count: 0,
                                nb_pages: 0,
                            },
                        },
                    }),
                checkCustomDomainStatus: () =>
                    Promise.resolve({
                        data: {
                            created_datetime: '2021-07-29T10:41:10.343Z',
                            updated_datetime: '2021-07-29T10:41:10.343Z',
                            deleted_datetime: null,
                            id: 22,
                            hostname: 'gorgias.help',
                            help_center_id: 1,
                            status: 'pending',
                            verification_errors: [
                                'custom hostname does not CNAME to this zone.',
                            ],
                        },
                    }),
            },
        }),
    }
})

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const defaultState: Partial<RootState> = {}

const ReduxProvider = ({children}: {children?: React.ReactNode}) => (
    <Provider store={mockStore(defaultState)}>{children}</Provider>
)

describe('<CustomDomain />', () => {
    it('renders in disabled state while fetching data', () => {
        render(<CustomDomain />, {wrapper: ReduxProvider})

        const input = screen.queryByPlaceholderText(
            'help.brand-name.com'
        ) as HTMLInputElement

        expect(input.value).toEqual('')
        expect(input.disabled).toBeTruthy()
    })

    it('has Add Domain button active if input has value', () => {
        render(<CustomDomain />, {wrapper: ReduxProvider})

        const input = screen.queryByPlaceholderText(
            'help.brand-name.com'
        ) as HTMLInputElement

        fireEvent.change(input, {target: {value: 'gorgias.help'}})

        const addDomainBtn = screen.queryByTestId(
            'create-domain-btn'
        ) as HTMLButtonElement

        expect(input.value).toEqual('gorgias.help')
        expect(addDomainBtn.disabled).toBeFalsy()
    })

    it('adds a new domain', () => {
        render(<CustomDomain />, {wrapper: ReduxProvider})

        const input = screen.queryByPlaceholderText(
            'help.brand-name.com'
        ) as HTMLInputElement

        const addDomainBtn = screen.queryByTestId(
            'create-domain-btn'
        ) as HTMLButtonElement

        void act(async () => {
            fireEvent.change(input, {target: {value: 'gorgias.help'}})
            fireEvent.click(addDomainBtn)

            await screen.findByText('Connection in progress')
        })
    })

    it('"Check Status" button updates the status of the connection', async () => {
        render(<CustomDomain />, {wrapper: ReduxProvider})

        const input = screen.queryByPlaceholderText(
            'help.brand-name.com'
        ) as HTMLInputElement

        const addDomainBtn = screen.queryByTestId(
            'create-domain-btn'
        ) as HTMLButtonElement

        fireEvent.change(input, {target: {value: 'gorgias.help'}})
        fireEvent.click(addDomainBtn)

        await screen.findByText('Connection in progress')

        const checkStatusBtn = screen.queryByText(
            'Check Status'
        ) as HTMLButtonElement

        fireEvent.click(checkStatusBtn)

        await screen.findByText('Error connecting')
    })

    it('removes the connection status when deleting the domain', async () => {
        render(<CustomDomain />, {wrapper: ReduxProvider})

        const input = screen.queryByPlaceholderText(
            'help.brand-name.com'
        ) as HTMLInputElement

        const addDomainBtn = screen.queryByTestId(
            'create-domain-btn'
        ) as HTMLButtonElement

        fireEvent.change(input, {target: {value: 'gorgias.help'}})
        fireEvent.click(addDomainBtn)

        await waitForElementToBeRemoved(addDomainBtn)

        const connectionStatus = screen.queryByTestId('connection-status')
        const deleteDomain = screen.queryByTestId(
            'delete-domain-btn'
        ) as HTMLButtonElement

        fireEvent.click(deleteDomain)

        await waitForElementToBeRemoved(connectionStatus)
    })
})
