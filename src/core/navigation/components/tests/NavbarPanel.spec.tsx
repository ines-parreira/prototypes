import {render, screen} from '@testing-library/react'
import React from 'react'

import {Panels} from 'core/layout/panels'

import NavbarPanel from '../NavbarPanel'

describe('NavbarPanel', () => {
    it('should render the children', () => {
        render(
            <Panels size={1000}>
                <NavbarPanel>NavbarPanel</NavbarPanel>
            </Panels>
        )
        expect(screen.getByText('NavbarPanel')).toBeInTheDocument()
    })
})
