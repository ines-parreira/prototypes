import { screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import type { RootState, StoreDispatch } from 'state/types'
import { renderWithRouter } from 'utils/testing'

import LoopReturnsIntegrationCreateModal from '../LoopReturnsIntegrationCreateModal'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

describe('<LoopReturnsIntegrationCreateModal />', () => {
    it('should render component', () => {
        renderWithRouter(
            <Provider store={mockStore({})}>
                <LoopReturnsIntegrationCreateModal
                    isOpen={true}
                    onClose={jest.fn()}
                    onCreate={jest.fn()}
                />
            </Provider>,
        )

        expect(
            screen.getByText('Create new return integration'),
        ).toBeInTheDocument()
    })
})
