import React from 'react'
import {render} from '@testing-library/react'

import ShortcutIcon from '../ShortcutIcon'

describe('<ShortcutIcon />', () => {
    it('should render an icon', () => {
        const {container} = render(<ShortcutIcon>⌘</ShortcutIcon>)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a dark icon', () => {
        const {container} = render(<ShortcutIcon type="dark">⌘</ShortcutIcon>)

        expect(container.firstChild).toMatchSnapshot()
    })
})
