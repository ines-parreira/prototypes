import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {TitleWrapper} from './../Customer'

describe('Customer', () => {
    describe('TitleWrapper', () => {
        it('should render', () => {
            const component = shallow((
                <TitleWrapper
                    source={fromJS({
                        hash: 'a8s4d86as54d'
                    })}
                />
            ), {
                context: {
                    integration: fromJS({
                        meta: {store_name: 'mystore'}
                    })
                }
            })

            expect(component).toMatchSnapshot()
        })
    })
})
