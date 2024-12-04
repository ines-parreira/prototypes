import {fireEvent, render} from '@testing-library/react'
import React, {ComponentProps} from 'react'

import SpotlightNoResults from '../SpotlightNoResults'

describe('<SpotlightNoResults />', () => {
    const mockHandleAdvancedSearch = jest.fn()
    const componentProps: ComponentProps<typeof SpotlightNoResults> = {
        handleAdvancedSearch: mockHandleAdvancedSearch,
        title: 'No results',
        bodyText:
            'You may want to try using different keywords or check for typos.',
    }

    it('should render', () => {
        const {container} = render(<SpotlightNoResults {...componentProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should handle link click', () => {
        const {getByText} = render(<SpotlightNoResults {...componentProps} />)

        fireEvent.click(getByText(/Use advanced search/i))
        expect(mockHandleAdvancedSearch).toHaveBeenCalled()
    })

    it('should handle showAdvancedSearch prop', () => {
        const {queryByText} = render(
            <SpotlightNoResults
                {...componentProps}
                showAdvancedSearch={false}
            />
        )

        expect(queryByText(/Use advanced search/i)).toBeNull()
    })
})
