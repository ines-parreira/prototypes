import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { ActionEventsNumberedPagination } from '../ActionEventsNumberedPagination'

describe('<ActionEventsNumberedPagination />', () => {
    it('should render component', () => {
        render(
            <ActionEventsNumberedPagination
                onChange={jest.fn()}
                count={4}
                page={1}
            />,
        )
        expect(screen.getByText('4')).toBeInTheDocument()
    })
})
