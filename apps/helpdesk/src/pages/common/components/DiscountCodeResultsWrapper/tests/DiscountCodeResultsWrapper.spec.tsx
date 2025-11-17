import React from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { integrationsState } from 'fixtures/integrations'
import ToolbarProvider from 'pages/common/draftjs/plugins/toolbar/ToolbarProvider'

import type { DiscountCodeResultsWrapperProps } from '../DiscountCodeResultsWrapper'
import { DiscountCodeResultsWrapper } from '../DiscountCodeResultsWrapper'

describe('<DiscountCodeResultsWrapper />', () => {
    const middlewares = [thunk]

    const mockStore = configureMockStore(middlewares)

    const store = mockStore({})

    const props: DiscountCodeResultsWrapperProps = {
        integration: fromJS({
            ...integrationsState.integration,
            meta: {
                ...integrationsState.integration.meta,
                oauth: {
                    scope: ['read_discounts', 'write_discounts'],
                },
            },
        }),
        onDiscountSelected: jest.fn(),
    }

    it('only renders Generic DiscountCodes component if feature flag is disabled', () => {
        const { queryByText } = render(
            <Provider store={store}>
                <ToolbarProvider
                    canAddProductCard={true}
                    onAddProductCardAttachment={jest.fn()}
                    canAddDiscountCodeLink={false}
                    canAddVideoPlayer={false}
                    shopifyIntegrations={fromJS([])}
                    supportsUniqueDiscountOffer={false}
                >
                    <DiscountCodeResultsWrapper {...props} />
                </ToolbarProvider>
            </Provider>,
        )
        const uniqueCodesOfferTab = queryByText('Unique Codes Offer')
        expect(uniqueCodesOfferTab).not.toBeInTheDocument()
    })
    it('renders both code components if feature flag is enabled', () => {
        const { getByText } = render(
            <Provider store={store}>
                <ToolbarProvider
                    canAddProductCard={true}
                    onAddProductCardAttachment={jest.fn()}
                    canAddDiscountCodeLink={false}
                    canAddVideoPlayer={false}
                    shopifyIntegrations={fromJS([])}
                    supportsUniqueDiscountOffer
                >
                    <DiscountCodeResultsWrapper {...props} />
                </ToolbarProvider>
            </Provider>,
        )
        const uniqueCodesOfferTab = getByText('Unique Codes Offer')
        expect(uniqueCodesOfferTab).toBeInTheDocument()
    })
})
