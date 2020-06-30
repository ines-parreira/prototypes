import {shallow} from 'enzyme'
import React from 'react'

import {APIViewComponent} from '../APIView'

describe('<APIView/>', () => {
    const minProps = {
        domain: 'justatest',
    }

    describe('render()', () => {
        it('should render a Reset Button', () => {
            const component = shallow(
                <APIViewComponent
                    {...minProps}
                    fetchCurrentAuths={() => {}}
                    apiKey="4a75a69bb409c2cd4041df29f5791103acaf0991bf0d0b3fa022951830482510"
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render a Create API Key Button', () => {
            const component = shallow(
                <APIViewComponent {...minProps} fetchCurrentAuths={() => {}} />
            )

            expect(component).toMatchSnapshot()
        })
    })
})
