import React from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'

import {IntegrationContext} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/IntegrationContext'

import {TitleWrapper} from '../Customer'

const integrationContextData = {
    integration: fromJS({meta: {store_name: 'mystore'}}),
    integrationId: 1,
}

describe('Customer', () => {
    describe('TitleWrapper', () => {
        it('should render default link because no custom link is set', () => {
            const {container} = render(
                <IntegrationContext.Provider value={integrationContextData}>
                    <TitleWrapper
                        source={fromJS({
                            hash: 'a8s4d86as54d',
                        })}
                        template={fromJS({})}
                    />{' '}
                </IntegrationContext.Provider>
            )

            expect(container).toMatchSnapshot()
        })

        it('should render custom link because it is set', () => {
            const {container} = render(
                <IntegrationContext.Provider value={integrationContextData}>
                    <TitleWrapper
                        source={fromJS({
                            hash: 'a8s4d86as54d',
                        })}
                        template={fromJS({
                            meta: {link: 'https://gorgias.io/{{hash}}/'},
                        })}
                    />{' '}
                </IntegrationContext.Provider>
            )

            expect(container).toMatchSnapshot()
        })
    })
})
