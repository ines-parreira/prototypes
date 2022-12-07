import React, {ComponentProps} from 'react'
import {shallow} from 'enzyme'

import {MAX_TICKET_COUNT_PER_VIEW} from 'config/views'
import {ViewCountContainer} from '../ViewCount'

const minProps: ComponentProps<typeof ViewCountContainer> = {
    viewId: 1,
    viewCount: 0,
    isDeactivated: false,
}

describe('<ViewCount/>', () => {
    it('should render an error icon because view is deactivated', () => {
        const component = shallow(
            <ViewCountContainer {...minProps} isDeactivated={true} />
        )

        expect(component).toMatchSnapshot()
    })

    it('should not render anything because view has no count', () => {
        const component = shallow(
            <ViewCountContainer {...minProps} viewCount={undefined} />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render uncompacted count', () => {
        const component = shallow(
            <ViewCountContainer {...minProps} viewCount={111} />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render compacted count', () => {
        const component = shallow(
            <ViewCountContainer {...minProps} viewCount={1111} />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render max count', () => {
        const component = shallow(
            <ViewCountContainer
                {...minProps}
                viewCount={MAX_TICKET_COUNT_PER_VIEW + 111}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
