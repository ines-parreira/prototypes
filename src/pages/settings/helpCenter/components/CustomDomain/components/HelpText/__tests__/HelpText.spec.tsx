import React from 'react'
import {screen, render} from '@testing-library/react'

import {HelpText} from '../HelpText'

describe('<HelpText />', () => {
    it('matches snapshot', () => {
        const {container} = render(
            <HelpText status="pending" onCheckStatus={() => null} />
        )
        expect(container).toMatchSnapshot()
    })

    it('not renders if status is active or missing', () => {
        const {rerender} = render(
            <HelpText status="active" onCheckStatus={() => null} />
        )

        expect(screen.queryByTestId('domain-help')).toBeNull()

        rerender(<HelpText onCheckStatus={() => null} />)

        expect(screen.queryByTestId('domain-help')).toBeNull()
    })
})
