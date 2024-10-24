import {render} from '@testing-library/react'
import React from 'react'

import {EditionContext} from 'providers/infobar/EditionContext'

import StaticField from '../StaticField'
import UIStaticField from '../views/StaticField'

jest.mock('../views/StaticField', () => jest.fn(() => <div>field</div>))

describe('<StaticField/>', () => {
    it('should pass isDisabled props if edition context is set to true', () => {
        render(
            <EditionContext.Provider value={{isEditing: true}}>
                <StaticField>field</StaticField>
            </EditionContext.Provider>
        )

        expect(UIStaticField).toHaveBeenCalledWith(
            expect.objectContaining({isDisabled: true}),
            {}
        )
    })

    it('should not pass isDisabled props if edition context is set to false', () => {
        render(
            <EditionContext.Provider value={{isEditing: false}}>
                <StaticField>field</StaticField>
            </EditionContext.Provider>
        )

        expect(UIStaticField).toHaveBeenCalledWith(
            expect.objectContaining({isDisabled: false}),
            {}
        )
    })
})
