import React from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'

import {IntegrationContext} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/IntegrationContext'

import Customer from '../Customer'

const TitleWrapper = Customer().TitleWrapper

describe('<TitleWrapper/>', () => {
    describe('render()', () => {
        it('should not render link because there is no admin url suffix', () => {
            const {container} = render(
                <IntegrationContext.Provider
                    value={{
                        integrationId: null,
                        integration: fromJS({
                            meta: {
                                store_url: 'magento.gorgi.us',
                                admin_url_suffix: '',
                            },
                        }),
                    }}
                >
                    <TitleWrapper source={fromJS({id: 1})}>
                        <div>foo bar</div>
                    </TitleWrapper>
                </IntegrationContext.Provider>
            )

            expect(container).toMatchSnapshot()
        })

        it('should render link', () => {
            const {container} = render(
                <IntegrationContext.Provider
                    value={{
                        integrationId: null,
                        integration: fromJS({
                            meta: {
                                store_url: 'magento.gorgi.us',
                                admin_url_suffix: 'admin_12fg',
                            },
                        }),
                    }}
                >
                    <TitleWrapper source={fromJS({id: 1})}>
                        <div>foo bar</div>
                    </TitleWrapper>
                </IntegrationContext.Provider>
            )

            expect(container).toMatchSnapshot()
        })
    })
})
