import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import UpgradeButton from '../UpgradeButton'

describe('UpgradeButton', () => {
    it('should display with default props', () => {
        const { container } = render(
            <MemoryRouter>
                <UpgradeButton />
            </MemoryRouter>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display with custom props', () => {
        const { container } = render(
            <MemoryRouter>
                <UpgradeButton label="a label" className="button-class" />
            </MemoryRouter>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display with custom callback', () => {
        const { container } = render(
            <MemoryRouter>
                <UpgradeButton
                    label="a label"
                    className="button-class"
                    onClick={jest.fn()}
                />
            </MemoryRouter>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
