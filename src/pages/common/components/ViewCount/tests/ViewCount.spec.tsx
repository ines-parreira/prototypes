import React, {ComponentProps} from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {ViewCountContainer} from '../ViewCount'
import {MAX_TICKET_COUNT_PER_VIEW} from '../../../../../config/views'

const minProps = ({
    view: fromJS({id: 1, deactivated_datetime: null}),
    getViewCount: jest.fn(),
} as unknown) as ComponentProps<typeof ViewCountContainer>

describe('<ViewCount/>', () => {
    it('should render an error icon because view is deactivated', () => {
        const view = fromJS({
            id: 1,
            deactivated_datetime: '2020-06-15 22:56:32.708038',
        })

        const component = shallow(
            <ViewCountContainer {...minProps} view={view} />
        )

        expect(component).toMatchSnapshot()
    })

    it('should not render anything because view has no count', () => {
        ;(minProps.getViewCount as jest.MockedFunction<
            typeof minProps.getViewCount
        >).mockReturnValueOnce((null as unknown) as number)

        const component = shallow(<ViewCountContainer {...minProps} />)

        expect(component).toMatchSnapshot()
    })

    it('should render uncompacted count', () => {
        ;(minProps.getViewCount as jest.MockedFunction<
            typeof minProps.getViewCount
        >).mockReturnValueOnce(111)

        const component = shallow(<ViewCountContainer {...minProps} />)

        expect(component).toMatchSnapshot()
    })

    it('should render compacted count', () => {
        ;(minProps.getViewCount as jest.MockedFunction<
            typeof minProps.getViewCount
        >).mockReturnValueOnce(1111)

        const component = shallow(<ViewCountContainer {...minProps} />)

        expect(component).toMatchSnapshot()
    })

    it('should render max count', () => {
        ;(minProps.getViewCount as jest.MockedFunction<
            typeof minProps.getViewCount
        >).mockReturnValueOnce(MAX_TICKET_COUNT_PER_VIEW + 111)

        const component = shallow(<ViewCountContainer {...minProps} />)

        expect(component).toMatchSnapshot()
    })
})
