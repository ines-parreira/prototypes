import React from 'react'
import {render} from '@testing-library/react'

import {DEFAULT_THEME, HELP_CENTER_DEFAULT_COLOR} from '../../../constants'

import {ThemeSwitch} from '../ThemeSwitch'

describe('<ThemeSwitch>', () => {
    it('matches snapshot', () => {
        const {container} = render(
            <ThemeSwitch
                selectedTheme={DEFAULT_THEME}
                currentColor={HELP_CENTER_DEFAULT_COLOR}
                onThemeChange={jest.fn()}
                onColorChange={jest.fn()}
            />
        )

        expect(container).toMatchSnapshot()
    })
})
