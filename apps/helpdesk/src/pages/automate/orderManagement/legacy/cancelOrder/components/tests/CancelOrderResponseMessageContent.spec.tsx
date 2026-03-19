import React from 'react'

import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import type { ShopifyIntegration } from 'models/integration/types'
import type { RootState, StoreDispatch } from 'state/types'

import CancelOrderFlowViewContext from '../../CancelOrderFlowViewContext'
import CancelOrderResponseMessageContent from '../CancelOrderResponseMessageContent'

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
            </Provider>,
        )

        expect(
            screen.getByText(/customers request a cancellation/i),
        ).toBeInTheDocument()
    })
})
