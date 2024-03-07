import React from 'react'
import {screen, render} from '@testing-library/react'

import {HelpText} from '../HelpText'

describe('<HelpText />', () => {
    it('matches snapshot', () => {
        const {queryByTestId} = render(<HelpText isHidden={false} />)

        expect(queryByTestId('domain-help')).not.toBeNull()
    })

    it('not renders if isHidden is true', () => {
        render(<HelpText isHidden />)

        expect(screen.queryByTestId('domain-help')).toBeNull()
    })
})
