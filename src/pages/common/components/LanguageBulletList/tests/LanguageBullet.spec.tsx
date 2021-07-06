import React from 'react'
import {render} from '@testing-library/react'

import {LanguageBullet} from '../LanguageBullet'

describe('<LanguageBullet />', () => {
    it('displays nothing if both the code and count are missing', () => {
        const {container} = render(<LanguageBullet />)
        expect(container.firstChild).toBeNull()
    })

    it('displays the flag if a locale code is passed', () => {
        const {getByTestId} = render(<LanguageBullet code="en-us" />)

        getByTestId('flag-en-us')
    })

    it('displays the overflow text if a count is passed', () => {
        const {getByText, getByTestId} = render(<LanguageBullet count={3} />)
        getByText('+3')
        getByTestId('locale-bullet-overflow')
    })
})
