import React from 'react'
import {render} from '@testing-library/react'

import HomePageLink from '../HomePageLink'

describe('<HomePageLink />', () => {
    it('should not render the link if candu has not loaded', () => {
        const {container, queryByTestId} = render(<HomePageLink />)

        expect(queryByTestId('home-page-link')).toBe(null)
        expect(container).toMatchSnapshot()
    })

    it('should render the link if candu has some nodes injected', () => {
        const canduNodes = new Map()
        const canduRoot = document.createElement('div')
        canduRoot.appendChild(document.createElement('img'))
        canduNodes.set(canduRoot, {shadowChild: canduRoot})
        window.Candu = {
            elementCanduRootMap: canduNodes,
        }
        const {baseElement, queryByTestId} = render(<HomePageLink />)

        expect(queryByTestId('home-page-link')).not.toBe(null)
        expect(baseElement).toMatchSnapshot()
    })

    it('should NOT render the link if candu has only injected the root', () => {
        const canduNodes = new Map()
        const canduRoot = document.createElement('div')
        canduNodes.set(canduRoot, {shadowChild: canduRoot})
        window.Candu = {
            elementCanduRootMap: canduNodes,
        }
        const {baseElement, queryByTestId} = render(<HomePageLink />)

        expect(queryByTestId('home-page-link')).toBe(null)
        expect(baseElement).toMatchSnapshot()
    })
})
