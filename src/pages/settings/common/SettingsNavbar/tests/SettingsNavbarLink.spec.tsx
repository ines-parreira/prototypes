import {render} from '@testing-library/react'
import React from 'react'

import SettingsNavbarLink from '../SettingsNavbarLink'

describe('<SettingsNavbarLink />', () => {
    const computedText = 'computedText'
    const extra = <div>extra</div>

    it('should render', () => {
        const {getByText} = render(
            <SettingsNavbarLink
                to="test"
                isActive={false}
                computedText={computedText}
                extra={extra}
                onClick={jest.fn()}
            />
        )
        expect(getByText(computedText)).toBeInTheDocument()
        expect(getByText('extra')).toBeInTheDocument()
    })

    it('should render as active', () => {
        const {container} = render(
            <SettingsNavbarLink
                to="test"
                isActive={true}
                computedText="test"
                extra={extra}
                onClick={jest.fn()}
            />
        )
        expect(container.firstChild).toHaveClass('active')
    })
})
