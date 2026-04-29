import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import LoopReturnsIntegrationCreateModal from '../LoopReturnsIntegrationCreateModal'

describe('<LoopReturnsIntegrationCreateModal />', () => {
    it('should render component', () => {
        render(
            <LoopReturnsIntegrationCreateModal
                isOpen={true}
                onClose={jest.fn()}
                onCreate={jest.fn()}
            />,
            {
                storeState: {},
            },
        )
        expect(
            screen.getByText('Create new return integration'),
        ).toBeInTheDocument()
    })
})
