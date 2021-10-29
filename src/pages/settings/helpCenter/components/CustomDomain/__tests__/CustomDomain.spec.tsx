import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    act,
    fireEvent,
    render,
    screen,
    waitForElementToBeRemoved,
} from '@testing-library/react'

import {initialState as articlesState} from '../../../../../../state/helpCenter/articles/reducer'
import {initialState as categoriesState} from '../../../../../../state/helpCenter/categories/reducer'
import {initialState as uiState} from '../../../../../../state/helpCenter/ui/reducer'
import {RootState, StoreDispatch} from '../../../../../../state/types'
import {getHelpCentersResponseFixture} from '../../../fixtures/getHelpCentersResponse.fixture'
import {CustomDomain} from '../CustomDomain'

jest.mock('../../../hooks/useHelpCenterIdParam', () => {
    return {
        useHelpCenterIdParam: jest.fn().mockReturnValue(1),
    }
})

jest.mock('../../../hooks/useHelpCenterApi', () => {
    return {
        useHelpCenterApi: jest.fn().mockReturnValue({
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
                updateHelpCenter: jest.fn().mockImplementation(() =>
                    Promise.resolve({
                        data: {
                            id: 1,
                            subdomain: 'acme',
                            name: 'ACME Help Center',
                            deactivated_datetime: null,
                            created_datetime: '2021-05-17T18:21:42.022Z',
                            updated_datetime: '2021-05-17T18:21:42.022Z',
                            deleted_datetime: undefined,
                            default_locale: 'en-US',
                            supported_locales: ['en-US'],
                            search_deactivated_datetime:
                                '2021-05-17T18:21:42.022Z',
                            algolia_api_key: null,
                            primary_color: '#4A8DF9',
                            theme: 'light',
                            powered_by_deactivated_datetime: null,
                        },
                    })
                ),
            },
        }),
    }
})

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const defaultState: Partial<RootState> = {
    entities: {
        helpCenters: {
            '1': getHelpCentersResponseFixture.data[0],
        },
    } as any,
    helpCenter: {
        ui: {...uiState, currentId: 1},
        articles: articlesState,
        categories: categoriesState,
    },
}

const store = mockStore(defaultState)

const ReduxProvider = ({children}: {children?: React.ReactNode}) => (
    <Provider store={store}>{children}</Provider>
)

describe('<CustomDomain />', () => {
    beforeEach(() => {
        store.clearActions()
    })

    it('has Add Domain button enabled if custom domain feature is enabled and input has value', () => {
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

            await screen.findByText('Verification in progress')
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

        await screen.findByText('Verification in progress')

        const checkStatusBtn = screen.queryByText(
            'Check Status'
        ) as HTMLButtonElement

        fireEvent.click(checkStatusBtn)

        await screen.findByText('Validation error')
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
