import React from 'react'
import {fireEvent, render, screen} from '@testing-library/react'

import {EditionContext} from 'providers/infobar/EditionContext'

import ExpandAllButton from '../ExpandAllButton'

describe('<ExpandAllButton/>', () => {
    it('should return null if in edition mode', () => {
        const {container} = render(
            <EditionContext.Provider value={{isEditing: true}}>
                <ExpandAllButton />
            </EditionContext.Provider>
        )
        expect(container.firstChild).toBeNull()
    })

    it('should display an icon whose default is to fold all on first click', () => {
        render(
            <EditionContext.Provider value={{isEditing: false}}>
                <ExpandAllButton />
            </EditionContext.Provider>
        )

        expect(screen.getByText('unfold_less'))
    })

    it('should propose to unfold more once icon has been clicked', () => {
        const wrappingDiv = document.createElement('div')
        wrappingDiv.className = 'widgetWrapper'
        render(
            <EditionContext.Provider value={{isEditing: false}}>
                <ExpandAllButton />
            </EditionContext.Provider>,
            {
                container: document.body.appendChild(wrappingDiv),
            }
        )

        fireEvent.click(screen.getByText('unfold_less').closest('span')!)

        expect(screen.getByText('unfold_more'))
    })
})
