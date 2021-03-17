import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {OutlookIntegrationSetupContainer} from '../OutlookIntegrationSetup'

describe('<OutlookIntegrationSetup/>', () => {
    describe('render()', () => {
        const minProps = {
            actions: {
                activateOnboardingIntegrations: jest.fn(),
                fetchOutlookOnboardingIntegrations: () => Promise.resolve(),
            },
            integrations: fromJS([]),
            loading: fromJS({
                updateIntegration: false,
            }),
            pagination: fromJS({
                item_count: 0,
                nb_pages: 1,
                page: 1,
            }),
        }

        it('should render the list of integrations with 0 address', () => {
            const component = shallow(
                <OutlookIntegrationSetupContainer {...minProps} />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render the list of integrations with 1 address', () => {
            const component = shallow(
                <OutlookIntegrationSetupContainer
                    {...minProps}
                    integrations={fromJS([
                        {
                            id: 1,
                            meta: {address: 'email1@foo.com'},
                            name: 'Address 1',
                        },
                    ])}
                    pagination={fromJS({
                        item_count: 1,
                        nb_pages: 1,
                        page: 1,
                    })}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render the list of integrations with 2 addresses', () => {
            const component = shallow(
                <OutlookIntegrationSetupContainer
                    {...minProps}
                    integrations={fromJS([
                        {
                            id: 1,
                            meta: {address: 'email1@foo.com'},
                            name: 'Address 1',
                        },
                        {
                            id: 2,
                            meta: {address: 'email2@foo.com'},
                            name: 'Address 2',
                        },
                    ])}
                    pagination={fromJS({
                        item_count: 2,
                        nb_pages: 1,
                        page: 1,
                    })}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })
})
