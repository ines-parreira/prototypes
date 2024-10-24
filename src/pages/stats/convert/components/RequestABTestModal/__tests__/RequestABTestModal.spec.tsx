import {render, fireEvent} from '@testing-library/react'
import React from 'react'

import RequestABTestModal from '../RequestABTestModal'

describe('RequestABTestModal', () => {
    it('renders correctly', () => {
        const onSubmit = jest.fn()
        const {getByText, getByTestId} = render(
            <RequestABTestModal
                isOpen={true}
                onClose={jest.fn()}
                onSubmit={onSubmit}
            />
        )

        expect(
            getByText(
                'Assess the effectiveness of your campaigns and measure the incremental lift.'
            )
        ).toBeInTheDocument()

        expect(getByText('Start A test')).toBeInTheDocument()
        expect(getByTestId('request-test-button')).toBeInTheDocument()
        fireEvent.click(getByTestId('request-test-button'))
        expect(onSubmit).toHaveBeenCalledTimes(1)
    })
})
