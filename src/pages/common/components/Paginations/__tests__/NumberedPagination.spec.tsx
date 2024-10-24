import {render} from '@testing-library/react'
import React from 'react'

import {NumberedPagination} from '../NumberedPagination'

describe('<NumberedPagination />', () => {
    it('should render the component with default props', () => {
        const {container} = render(<NumberedPagination />)

        expect(container).toMatchSnapshot()
    })

    it('should render all pages if they fit', () => {
        const {getAllByLabelText} = render(<NumberedPagination count={5} />)

        expect(getAllByLabelText(/page-/)).toHaveLength(5)
    })

    it('should render the ellipsis if there are too many pages', () => {
        const {getAllByLabelText, getByLabelText} = render(
            <NumberedPagination count={10} />
        )

        getByLabelText('end-ellipsis')
        expect(getAllByLabelText(/page-/)).toHaveLength(6)
    })

    it('should render the start and end ellipsis if there are too many pages and the current page is in the middle', () => {
        const {getAllByLabelText, getByLabelText} = render(
            <NumberedPagination count={10} page={5} />
        )

        getByLabelText('start-ellipsis')
        getByLabelText('end-ellipsis')

        expect(getAllByLabelText(/page-/)).toHaveLength(5)
    })

    it('resets the page when the `page` prop is changed', () => {
        const {getByLabelText, rerender} = render(
            <NumberedPagination count={10} page={5} />
        )

        expect(getByLabelText('page-5')).toHaveAttribute('aria-current', 'true')

        rerender(<NumberedPagination count={10} page={1} />)

        expect(getByLabelText('page-1')).toHaveAttribute('aria-current', 'true')
    })
})
