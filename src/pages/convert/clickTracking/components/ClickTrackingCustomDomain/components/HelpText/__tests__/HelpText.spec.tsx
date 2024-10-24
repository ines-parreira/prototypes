import {screen, render} from '@testing-library/react'
import React from 'react'

import {HelpText} from '../HelpText'

describe('<HelpText />', () => {
    it('matches snapshot', () => {
        render(<HelpText isHidden={false} domain="example.com" />)

        expect(
            screen.getByText(/Visit the admin console of your domain registrar/)
        ).toBeInTheDocument()
    })

    it('not renders if isHidden is true', () => {
        render(<HelpText isHidden domain="example.com" />)

        expect(
            screen.queryByText(
                /Visit the admin console of your domain registrar/
            )
        ).not.toBeInTheDocument()
    })
})
