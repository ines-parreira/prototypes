import React from 'react'
import {render, fireEvent, waitFor} from '@testing-library/react'
import {Provider} from 'react-redux'
import {DeepPartial} from 'redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {useParams} from 'react-router-dom'
import {fromJS} from 'immutable'
import {RootState, StoreDispatch} from 'state/types'
import {selfServiceConfiguration1} from 'fixtures/self_service_configurations'
import {NewReturnIntegrationModal} from '../NewReturnIntegrationModal'

const mockStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>([
    thunk,
])
const useParamsMock = useParams as jest.MockedFunction<typeof useParams>

jest.mock('react-router')

describe('<NewReturnIntegrationModal />', () => {
    const defaultState = {
        entities: {
            selfServiceConfigurations: {
                [selfServiceConfiguration1.id]: selfServiceConfiguration1,
            },
        },
        integrations: fromJS({
            integrations: [
                {
                    id: 1,
                    type: 'shopify',
                    meta: {
                        shop_name: selfServiceConfiguration1.shop_name,
                    },
                    uri: `/api/integrations/1/`,
                },
            ],
        }),
    } as DeepPartial<RootState>

    useParamsMock.mockReturnValue({
        shopName: selfServiceConfiguration1.shop_name,
        integrationType: 'shopify',
    })

    it('should render new return integration modal', () => {
        const {baseElement} = render(
            <Provider store={mockStore(defaultState)}>
                <NewReturnIntegrationModal
                    isOpen
                    onClose={jest.fn()}
                    onCreate={jest.fn()}
                />
            </Provider>
        )

        expect(baseElement).toMatchSnapshot()
    })

    it('should create new Loop Returns integration and call onCreate() handler', async () => {
        const apiKey = 'api_key'
        const onCreateMock = jest.fn()
        const store = mockStore(defaultState)

        const {getByPlaceholderText, getByText} = render(
            <Provider store={store}>
                <NewReturnIntegrationModal
                    isOpen
                    onClose={jest.fn()}
                    onCreate={onCreateMock}
                />
            </Provider>
        )

        fireEvent.change(getByPlaceholderText('API Key'), {
            target: {value: apiKey},
        })
        fireEvent.click(getByText('Create'))

        expect(store.getActions()).toMatchSnapshot()

        await waitFor(() => {
            expect(onCreateMock).toHaveBeenCalledTimes(1)
        })
    })
})
