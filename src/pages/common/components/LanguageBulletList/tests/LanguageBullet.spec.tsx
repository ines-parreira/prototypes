import {render, screen} from '@testing-library/react'
import React from 'react'

import {LanguageBullet} from '../LanguageBullet'

describe('<LanguageBullet />', () => {
    it('displays nothing if both the code and count are missing', () => {
        const {container} = render(<LanguageBullet />)
        expect(container.firstChild).toBeNull()
    })

    it('displays the flag if a locale code is passed', () => {
        const code = 'en-us'
        render(<LanguageBullet code={code} />)

        screen.getByLabelText(`Picture for language ${code}`)
    })

    it('displays the overflow text if a count is passed', () => {
        render(<LanguageBullet count={3} />)

        screen.getByText('+3')
        screen.getByLabelText('Item for locale overflow')
    })
})
