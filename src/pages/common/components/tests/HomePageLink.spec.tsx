import React from 'react'
import {render} from '@testing-library/react'

import HomePageLink from '../HomePageLink'

describe('<HomePageLink />', () => {
    it('should not render the link if candu has not loaded', () => {
        const {container} = render(<HomePageLink />)
        expect(container).toMatchSnapshot()
    })

    it('should render the link if candu has some nodes injected', () => {
        const canduNodes = new Map()
        canduNodes.set('home-button', 'button')
        window.Candu = {
            elementCanduRootMap: canduNodes,
        }
        const {container} = render(<HomePageLink />)
        expect(container).toMatchSnapshot()
    })

    it('should (re)render when candu element is injected', () => {
        const {container, getByTestId} = render(<HomePageLink />)
        getByTestId('candu-hidden-link').innerHTML = '<span>candu button</span>'
        expect(container).toMatchSnapshot()
    })
})
