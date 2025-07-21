import React from 'react'

import { render, screen } from '@testing-library/react'

import CancelOrderEligibility from '../CancelOrderEligibility'

describe('<CancelOrderEligibility />', () => {
    it('should render component', () => {
        render(
            <CancelOrderEligibility
                onChange={jest.fn()}
                eligibility={{
                    key: 'key',
                    operator: 'operator',
                    value: 'value',
                }}
            />,
        )

        expect(screen.getByText('Eligibility window')).toBeInTheDocument()
    })
})
