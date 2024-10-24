import {render} from '@testing-library/react'
import React from 'react'

import Step from '../Step'

describe('Step', () => {
    it('renders given children', () => {
        const {getByTestId} = render(
            <Step
                body={<div data-testid="child-1" />}
                footer={<div data-testid="child-2" />}
            />
        )

        expect(getByTestId('child-1')).toBeInTheDocument()
        expect(getByTestId('child-2')).toBeInTheDocument()
    })
})
