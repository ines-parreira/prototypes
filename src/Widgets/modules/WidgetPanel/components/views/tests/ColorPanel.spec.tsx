import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import ColorPanel from '../ColorPanel'

describe('ColorPanel', () => {
    const defaultAccentColor = '#f00'
    const defaultProps: ComponentProps<typeof ColorPanel> = {
        accentColor: defaultAccentColor,
    }

    it('should render the accent color', () => {
        const {container} = render(<ColorPanel {...defaultProps} />)

        expect(container.firstChild).toHaveStyle({
            boxShadow: `inset 3px 0 0 ${defaultAccentColor}`,
        })
    })
})
