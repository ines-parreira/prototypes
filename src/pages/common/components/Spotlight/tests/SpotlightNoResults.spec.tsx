import React from 'react'
import {fireEvent, render} from '@testing-library/react'

import SpotlightNoResults from '../SpotlightNoResults'

describe('<SpotlightNoResults />', () => {
    it('should render', () => {
        const {container} = render(
            <SpotlightNoResults handleAdvancedSearch={jest.fn} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should handle link click', () => {
        const handleAdvancedSearch = jest.fn()
        const {getByText} = render(
            <SpotlightNoResults handleAdvancedSearch={handleAdvancedSearch} />
        )

        fireEvent.click(getByText(/Use advanced search/i))
        expect(handleAdvancedSearch).toHaveBeenCalled()
    })
})
