import React from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'

import {IntegrationContext} from '../../../components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/IntegrationContext'
import ProductSearchInput from '../ProductSearchInput'

describe('<ProductSearchInput/>', () => {
    describe('render()', () => {
        it('should render', () => {
            const {container} = render(
                <IntegrationContext.Provider
                    value={{integration: fromJS({}), integrationId: 1}}
                >
                    <ProductSearchInput />
                </IntegrationContext.Provider>
            )

            expect(container).toMatchSnapshot()
        })
    })
})
