import React from 'react'
import {render} from '@testing-library/react'

import {FlagLanguageItem} from '../FlagLanguageItem'

describe('<FlagLanguageItem />', () => {
    it('renders the emoji and name', () => {
        const {getByText, getByAltText} = render(
            <FlagLanguageItem code="en-us" name="English - USA" />
        )

        getByAltText('en-us')
        getByText('English - USA')
    })
})
