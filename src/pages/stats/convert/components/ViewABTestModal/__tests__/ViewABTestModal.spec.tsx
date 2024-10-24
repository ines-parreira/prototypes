import {fireEvent, render} from '@testing-library/react'
import React from 'react'

import ViewABTestModal from '../ViewABTestModal'

describe('ViewABTestModal', () => {
    it('renders', () => {
        const onSubmit = jest.fn()
        const {getByText, getByTestId} = render(
            <ViewABTestModal
                isOpen={true}
                onClose={jest.fn()}
                onSubmit={onSubmit}
            />
        )

        expect(getByText('You have an ongoing A/B test')).toBeInTheDocument()
        expect(getByTestId('stop-test-button')).toBeInTheDocument()

        fireEvent.click(getByTestId('stop-test-button'))
        expect(onSubmit).toHaveBeenCalledTimes(1)
    })
})
