import {render} from '@testing-library/react'
import React from 'react'

import UpgradeButton from '../UpgradeButton'

describe('UpgradeButton', () => {
    it('should display with default props', () => {
        const {container} = render(<UpgradeButton />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display with custom props', () => {
        const {container} = render(
            <UpgradeButton
                label="a label"
                size="sm"
                hasInvertedColors
                className="button-class"
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
