import React, {ComponentProps} from 'react'
import {shallow} from 'enzyme'

import {APIViewContainer} from '../APIView'

describe('<APIView/>', () => {
    const minProps: ComponentProps<typeof APIViewContainer> = {
        apiKey: '',
        email: '',
        domain: 'justatest',
        fetchCurrentAuths: jest.fn(),
        notify: jest.fn(),
        resetApiKey: jest.fn(),
    }

    describe('render()', () => {
        it('should render a Reset Button', () => {
            const component = shallow(
                <APIViewContainer
                    {...minProps}
                    apiKey="4a75a69bb409c2cd4041df29f5791103acaf0991bf0d0b3fa022951830482510"
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render a Create API Key Button', () => {
            const component = shallow(<APIViewContainer {...minProps} />)

            expect(component).toMatchSnapshot()
        })
    })
})
