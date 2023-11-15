import React from 'react'
import {render} from '@testing-library/react'

import {MAX_TICKET_COUNT_PER_VIEW} from 'config/views'

import {ViewCount} from '../ViewCount'

const minProps = {
    viewId: 1,
    viewCount: 0,
    isDeactivated: false,
}

describe('<ViewCount />', () => {
    it('should render an error icon because view is deactivated', () => {
        const {queryByText} = render(
            <ViewCount {...minProps} isDeactivated={true} />
        )

        expect(queryByText('error')).toBeInTheDocument()
    })

    it('should not render anything because view has no count', () => {
        const {container} = render(
            <ViewCount {...minProps} viewCount={undefined} />
        )

        expect(container.firstChild).toBeNull()
    })

    it('should render uncompacted count', () => {
        const {queryByText} = render(
            <ViewCount {...minProps} viewCount={111} />
        )

        expect(queryByText('111')).toBeInTheDocument()
    })

    it('should render compacted count', () => {
        const {queryByText} = render(
            <ViewCount {...minProps} viewCount={1111} />
        )

        expect(queryByText('1.1k')).toBeInTheDocument()
    })

    it('should render max count', () => {
        const {queryByText} = render(
            <ViewCount
                {...minProps}
                viewCount={MAX_TICKET_COUNT_PER_VIEW + 111}
            />
        )

        expect(queryByText('5k+')).toBeInTheDocument()
    })

    it('should render tooltip when view count overflows', () => {
        const {container} = render(<ViewCount {...minProps} viewCount={1001} />)

        expect(container.firstChild).toHaveAttribute('title', '1001 tickets')
    })
})
