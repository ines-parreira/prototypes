import React from 'react'
import {screen, render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {ShopifyIntegration} from 'models/integration/types'
import {RootState, StoreDispatch} from 'state/types'
import CancelOrderResponseMessageContent from '../CancelOrderResponseMessageContent'
import CancelOrderFlowViewContext from '../../CancelOrderFlowViewContext'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

describe('<CancelOrderResponseMessageContent  />', () => {
    it('should render component', () => {
        render(
            <Provider store={mockStore({})}>
                <CancelOrderFlowViewContext.Provider
                    value={{
                        setError: jest.fn(),
                        storeIntegration: {
                            id: 1,
                        } as ShopifyIntegration,
                    }}
                >
                    <CancelOrderResponseMessageContent
                        onChange={jest.fn()}
                        responseMessageContent={{
                            html: 'html',
                            text: 'text',
                        }}
                    />
                </CancelOrderFlowViewContext.Provider>
            </Provider>
        )

        expect(
            screen.getByText(/after customers request a cancellation/i)
        ).toBeInTheDocument()
    })
})
