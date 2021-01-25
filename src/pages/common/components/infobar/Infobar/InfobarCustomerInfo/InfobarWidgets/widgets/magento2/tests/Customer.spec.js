import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import Customer from '../Customer.tsx'

const TitleWrapper = Customer().TitleWrapper

describe('<TitleWrapper/>', () => {
    describe('render()', () => {
        it('should not render link because there is no admin url suffix', () => {
            const component = shallow(
                <TitleWrapper source={fromJS({id: 1})}>
                    <div>foo bar</div>
                </TitleWrapper>,
                {
                    context: {
                        integration: fromJS({
                            meta: {
                                store_url: 'magento.gorgi.us',
                                admin_url_suffix: '',
                            },
                        }),
                    },
                }
            )

            expect(component).toMatchSnapshot()
        })

        it('should render link', () => {
            const component = shallow(
                <TitleWrapper source={fromJS({id: 1})}>
                    <div>foo bar</div>
                </TitleWrapper>,
                {
                    context: {
                        integration: fromJS({
                            meta: {
                                store_url: 'magento.gorgi.us',
                                admin_url_suffix: 'admin_12fg',
                            },
                        }),
                    },
                }
            )

            expect(component).toMatchSnapshot()
        })
    })
})
