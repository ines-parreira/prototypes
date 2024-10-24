import {screen, render} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {ShopifyIntegration} from 'models/integration/types'

import TrackOrderFlowViewContext from '../../TrackOrderFlowViewContext'
import TrackOrderUnfulfilledMessage from '../TrackOrderUnfulfilledMessage'

const mockStore = configureMockStore([thunk])()

describe('<TrackOrderUnfulfilledMessage />', () => {
    it('should render component', () => {
        render(
            <Provider store={mockStore}>
                <TrackOrderFlowViewContext.Provider
                    value={{
                        storeIntegration: {id: 1} as ShopifyIntegration,
                        setError: jest.fn(),
                    }}
                >
                    <TrackOrderUnfulfilledMessage
                        onChange={jest.fn()}
                        responseMessageContent={{
                            html: 'response content',
                            text: 'response content',
                        }}
                        setIsFocused={jest.fn()}
                    />
                </TrackOrderFlowViewContext.Provider>
            </Provider>
        )

        expect(screen.getByText('response content')).toBeInTheDocument()
    })
})
