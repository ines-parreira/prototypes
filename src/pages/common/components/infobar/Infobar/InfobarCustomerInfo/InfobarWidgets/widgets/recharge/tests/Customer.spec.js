import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {TitleWrapper} from '../Customer'

describe('Customer', () => {
    describe('TitleWrapper', () => {
        it('should render default link because no custom link is set', () => {
            const component = shallow(
                <TitleWrapper
                    source={fromJS({
                        hash: 'a8s4d86as54d',
                    })}
                    template={fromJS({})}
                />,
                {
                    context: {
                        integration: fromJS({
                            meta: {store_name: 'mystore'},
                        }),
                    },
                }
            )

            expect(component).toMatchSnapshot()
        })

        it('should custom link because it is set', () => {
            const component = shallow(
                <TitleWrapper
                    source={fromJS({
                        hash: 'a8s4d86as54d',
                    })}
                    template={fromJS({
                        meta: {link: 'https://gorgias.io/{{hash}}/'},
                    })}
                />,
                {
                    context: {
                        integration: fromJS({
                            meta: {store_name: 'mystore'},
                        }),
                    },
                }
            )

            expect(component).toMatchSnapshot()
        })
    })
})
