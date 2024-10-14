import {render, screen} from '@testing-library/react'
import React from 'react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import {RootState, StoreDispatch} from 'state/types'
import LoopReturnsIntegrationCreateModal from '../LoopReturnsIntegrationCreateModal'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

describe('<LoopReturnsIntegrationCreateModal />', () => {
    it('should render component', () => {
        render(
            <Provider store={mockStore({})}>
                <LoopReturnsIntegrationCreateModal
                    isOpen={true}
                    onClose={jest.fn()}
                    onCreate={jest.fn()}
                />
            </Provider>
        )

        expect(
            screen.getByText('Create new return integration')
        ).toBeInTheDocument()
    })
})
