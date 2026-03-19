import React from 'react'

import { render, screen } from '@testing-library/react'

import ReturnOrderEligibility from '../ReturnOrderEligibility'

describe('<ReturnOrderEligibility />', () => {
    it('should render component', () => {
        render(
            <ReturnOrderEligibility
                onChange={jest.fn()}
                eligibility={{
                    key: 'test',
                    operator: 'operator',
                    value: 'value',
                }}
            />,
        )

        expect(screen.getByText('Eligibility window')).toBeInTheDocument()
    })
})
