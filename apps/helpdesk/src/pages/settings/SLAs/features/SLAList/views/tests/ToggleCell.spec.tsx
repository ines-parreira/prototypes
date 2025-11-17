import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import type { UISLAPolicy } from '../../types'
import ToggleCell from '../ToggleCell'

const policy = {
    id: '123',
    isActive: true,
    name: 'Policy Name',
} as unknown as UISLAPolicy

describe('<ToggleCell />', () => {
    it('should render a toggle input and policy name', () => {
        const { getByText, getByRole } = render(
            <MemoryRouter>
                <ToggleCell
                    policy={policy}
                    onToggle={jest.fn()}
                    dragRef={{ current: null }}
                />
            </MemoryRouter>,
        )
        expect(getByText(policy.name)).toBeInTheDocument()
        expect(getByRole('checkbox')).toBeInTheDocument()
    })
})
