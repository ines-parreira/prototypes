import React from 'react'
import {render} from '@testing-library/react'

import {BadgeItem} from '../BadgeItem'

describe('<BadgeItem />', () => {
    it('renders the close icon if <isClosable> is true', () => {
        const {getByText} = render(
            <BadgeItem id="something" label="Something" isClosable />
        )
        getByText('close')
    })

    it('renders the help icon if we have help content', () => {
        const {getByTestId} = render(
            <BadgeItem id="something" label="something" help="Lorem ipsum" />
        )

        getByTestId('help-something')
    })
})
