import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'

import {MAX_TICKET_COUNT_PER_VIEW} from 'config/views'
import {ViewCountContainer} from '../ViewCount'

const minProps: ComponentProps<typeof ViewCountContainer> = {
    viewId: 1,
    viewCount: 0,
    isDeactivated: false,
}

describe('<ViewCount/>', () => {
    it('should render an error icon because view is deactivated', () => {
        const {container} = render(
            <ViewCountContainer {...minProps} isDeactivated={true} />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not render anything because view has no count', () => {
        const {container} = render(
            <ViewCountContainer {...minProps} viewCount={undefined} />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render uncompacted count', () => {
        const {container} = render(
            <ViewCountContainer {...minProps} viewCount={111} />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render compacted count', () => {
        const {container} = render(
            <ViewCountContainer {...minProps} viewCount={1111} />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render max count', () => {
        const {container} = render(
            <ViewCountContainer
                {...minProps}
                viewCount={MAX_TICKET_COUNT_PER_VIEW + 111}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
