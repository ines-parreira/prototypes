import React, {ComponentProps} from 'react'
import {shallow} from 'enzyme'

import IconButton from 'pages/common/components/button/IconButton'
import {APIViewContainer} from '../APIView'

jest.mock('copy-to-clipboard')

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

        it("should change apiKeyType's value when clicking the visibility icon", () => {
            const component = shallow(
                <APIViewContainer
                    {...minProps}
                    apiKey="4a75a69bb409c2cd4041df29f5791103acaf0991bf0d0b3fa022951830482510"
                />
            )
            expect(component.state('apiKeyType')).toEqual('password')

            component.find(IconButton).at(0).simulate('click')

            expect(component.state('apiKeyType')).toEqual('text')
        })

        it('should copy the apiKey content to clipboard when clicking the copy button', () => {
            const component = shallow(
                <APIViewContainer
                    {...minProps}
                    apiKey="4a75a69bb409c2cd4041df29f5791103acaf0991bf0d0b3fa022951830482510"
                />
            )

            expect(component.state('isCopiedApiKey')).toEqual(false)

            component.find('.copyBtn').at(2).simulate('click')

            expect(component.state('isCopiedApiKey')).toEqual(true)
        })
    })
})
