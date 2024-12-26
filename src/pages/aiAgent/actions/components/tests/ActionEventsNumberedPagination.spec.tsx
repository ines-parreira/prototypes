import {screen} from '@testing-library/react'
import React from 'react'

import {renderWithRouter} from 'utils/testing'

import ActionEventsNumberedPagination from '../ActionEventsNumberedPagination'

describe('<ActionEventsNumberedPagination />', () => {
    it('should render component', () => {
        renderWithRouter(
            <ActionEventsNumberedPagination
                onChange={jest.fn()}
                count={4}
                page={1}
            />
        )

        expect(screen.getByText('4')).toBeInTheDocument()
    })
})
