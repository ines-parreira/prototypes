import React from 'react'

import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import type { ShopifyIntegration } from 'models/integration/types'
import type { RootState, StoreDispatch } from 'state/types'

import { useReturnOrderFlowViewContext } from '../../ReturnOrderFlowViewContext'
import ReturnOrderAutomatedResponseAction from '../ReturnOrderAutomatedResponseAction'

jest.mock('../../ReturnOrderFlowViewContext')

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

describe('<ReturnOrderAutomatedResponseAction />', () => {
    beforeEach(() => {
        ;(useReturnOrderFlowViewContext as jest.Mock).mockReturnValue({
            storeIntegration: { id: 1 } as ShopifyIntegration,
        })
    })
    it('should render component', () => {
        render(
            <Provider store={mockStore({})}>
                <ReturnOrderAutomatedResponseAction
                    onChange={jest.fn()}
                    responseMessageContent={{
                        html: 'response html',
                        text: 'response text',
                    }}
                />
            </Provider>,
        )

        expect(screen.getByText(/response text/i)).toBeInTheDocument()
    })
})
