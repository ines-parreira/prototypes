import React from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'

import _noop from 'lodash/noop'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'

import ProductSearchInput from '../ProductSearchInput'
import {shopifyDataMappers} from '../Mappings'

describe('<ProductSearchInput/>', () => {
    describe('render()', () => {
        it('should render', () => {
            const {container} = render(
                <IntegrationContext.Provider
                    value={{integration: fromJS({}), integrationId: 1}}
                >
                    <ProductSearchInput
                        dataMappers={shopifyDataMappers}
                        onVariantClicked={_noop}
                    />
                </IntegrationContext.Provider>
            )

            expect(container).toMatchSnapshot()
        })
    })
})
