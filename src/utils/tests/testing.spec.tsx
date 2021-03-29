import React from 'react'

import {renderWithRouter} from '../testing'

describe('testing', () => {
    describe('renderWithRouter', () => {
        it('should render', () => {
            const {container} = renderWithRouter(<div>Bloup</div>)
            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
