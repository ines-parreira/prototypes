import React from 'react'
import {render} from '@testing-library/react'

import {UISLAPolicy} from '../../types'
import ToggleCell from '../ToggleCell'

const policy = {
    id: '123',
    isActive: true,
    name: 'Policy Name',
} as unknown as UISLAPolicy

describe('<ToggleCell />', () => {
    it('should render a toggle input and policy name', () => {
        const {getByText, getByRole} = render(<ToggleCell policy={policy} />)
        expect(getByText(policy.name)).toBeInTheDocument()
        expect(getByRole('checkbox')).toBeInTheDocument()
    })
})
