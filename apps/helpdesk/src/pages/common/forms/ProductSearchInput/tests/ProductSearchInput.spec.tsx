import { render } from '@repo/testing'
import { fromJS } from 'immutable'
import { noop } from '@gorgias/toolkit'
import { IntegrationContext } from 'providers/infobar/IntegrationContext'

import { shopifyDataMappers } from '../Mappings'
import { ProductSearchInput } from '../ProductSearchInput'

describe('<ProductSearchInput/>', () => {
    describe('render()', () => {
        it('should render', () => {
            const { container } = render(
                <IntegrationContext.Provider
                    value={{ integration: fromJS({}), integrationId: 1 }}
                >
                    <ProductSearchInput
                        dataMappers={shopifyDataMappers}
                        onVariantClicked={noop}
                    />
                </IntegrationContext.Provider>,
            )

            expect(container).toMatchSnapshot()
        })
    })
})
