import React from 'react'
import {screen, render} from '@testing-library/react'

import {HelpText} from '../HelpText'

describe('<HelpText />', () => {
    it('matches snapshot', () => {
        render(<HelpText isHidden={false} />)

        expect(
            screen.getByText(/Visit the admin console of your domain registrar/)
        ).toBeInTheDocument()
    })

    it('not renders if isHidden is true', () => {
        render(<HelpText isHidden />)

        expect(
            screen.queryByText(
                /Visit the admin console of your domain registrar/
            )
        ).not.toBeInTheDocument()
    })
})
