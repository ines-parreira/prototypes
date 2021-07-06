import React from 'react'
import {render} from '@testing-library/react'

import {FlagLanguageItem} from '../FlagLanguageItem'

describe('<FlagLanguageItem />', () => {
    it('renders the emoji and name', () => {
        const {getByText} = render(
            <FlagLanguageItem code="en-us" name="English - USA" />
        )

        getByText('🇺🇸')
        getByText('English - USA')
    })
})
