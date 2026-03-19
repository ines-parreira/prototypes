import React from 'react'

import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { ReturnActionType } from 'models/selfServiceConfiguration/types'
import type { RootState, StoreDispatch } from 'state/types'

import ReturnOrderAction from '../ReturnOrderAction'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

describe('<ReturnOrderAction />', () => {
    it('should render component', () => {
        render(
            <Provider
                store={mockStore({
                    integrations: fromJS({
                        integrations: [
                            {
                                id: 1,
                                name: 'Loop Returns',
                                type: 'http',
                                http: {
                                    url: 'https://api.loopreturns.com/test',
                                },
                            },
                        ],
                    }),
                })}
            >
                <ReturnOrderAction
                    onChange={jest.fn()}
                    action={{
                        integrationId: 1,
                        type: ReturnActionType.LoopReturns,
                    }}
                />
            </Provider>,
        )

        expect(screen.getByText('Loop Returns')).toBeInTheDocument()
    })
})
