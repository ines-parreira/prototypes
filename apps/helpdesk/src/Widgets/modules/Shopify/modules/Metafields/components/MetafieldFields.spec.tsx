import React from 'react'

import { render, screen } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import type { ShopifyMetafieldType } from '@gorgias/helpdesk-types'

import type { IntegrationContextType } from 'providers/infobar/IntegrationContext'
import { IntegrationContext } from 'providers/infobar/IntegrationContext'

import { LinkMetafield, ReferenceMetafield } from './MetafieldFields'

const mockStore = configureMockStore()
const store = mockStore({
    currentAccount: fromJS({ domain: 'domain' }),
})

const mockIntegrationContext: IntegrationContextType = {
    integration: Map<string, unknown>(
        fromJS({
            name: 'test-store',
        }),
    ),
    integrationId: 1,
}

const renderReferenceMetafield = (
    value: string,
    type: ShopifyMetafieldType,
    context?: IntegrationContextType | null,
) => {
    const contextValue =
        context === null ? undefined : context || mockIntegrationContext

    return render(
        <Provider store={store}>
            {contextValue ? (
                <IntegrationContext.Provider value={contextValue}>
                    <ReferenceMetafield value={value} type={type} />
                </IntegrationContext.Provider>
            ) : (
                <ReferenceMetafield value={value} type={type} />
            )}
        </Provider>,
    )
}

describe('ReferenceMetafield', () => {
    describe('supported reference types', () => {
        it('should render link with gid for product_reference', () => {
            const gidValue = 'gid://shopify/Product/471971234070'
            renderReferenceMetafield(gidValue, 'product_reference')

            const link = screen.getByRole('link', { name: '471971234070' })
            expect(link).toBeInTheDocument()
            expect(link).toHaveAttribute(
                'href',
                'https://admin.shopify.com/store/test-store/products/471971234070',
            )
            expect(link).toHaveAttribute('target', '_blank')
            expect(link).toHaveAttribute('rel', 'noreferrer')
            expect(screen.getByRole('button')).toBeInTheDocument()
        })

        it('should render link with gid for collection_reference', () => {
            const gidValue = 'gid://shopify/Collection/123456'
            renderReferenceMetafield(gidValue, 'collection_reference')

            const link = screen.getByRole('link', { name: '123456' })
            expect(link).toBeInTheDocument()
            expect(link).toHaveAttribute(
                'href',
                'https://admin.shopify.com/store/test-store/collections/123456',
            )
            expect(screen.getByRole('button')).toBeInTheDocument()
        })
    })

    describe('Fallback case - unsupported metafield types', () => {
        it('should return null when prepareGidUrl returns undefined for variant_reference', () => {
            const gidValue = 'gid://shopify/ProductVariant/40416320323627'
            const { container } = renderReferenceMetafield(
                gidValue,
                'variant_reference' as ShopifyMetafieldType,
            )

            expect(screen.queryByRole('link')).not.toBeInTheDocument()
            expect(screen.queryByRole('button')).not.toBeInTheDocument()
            expect(container.querySelector('a')).not.toBeInTheDocument()
            expect(container.firstChild).toBeNull()
        })
    })
})

const renderLinkMetafield = (value: { text: string; url: string }) => {
    return render(
        <Provider store={store}>
            <LinkMetafield value={value} />
        </Provider>,
    )
}

describe('LinkMetafield', () => {
    it('should render link with custom text when text is provided', () => {
        const value = {
            text: 'Click here',
            url: 'https://example.com/page',
        }
        renderLinkMetafield(value)

        const link = screen.getByRole('link', { name: 'Click here' })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', 'https://example.com/page')
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noreferrer')
        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should render link with shortened URL when text is empty', () => {
        const value = {
            text: '',
            url: 'https://example.com/page',
        }
        renderLinkMetafield(value)

        const link = screen.getByRole('link', { name: 'example.com/page' })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', 'https://example.com/page')
        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should truncate long URLs when text is not provided', () => {
        const value = {
            text: '',
            url: 'https://example.com/very/long/path/that/exceeds/twenty/characters',
        }
        renderLinkMetafield(value)

        const link = screen.getByRole('link', {
            name: 'example.com/very/lon...',
        })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute(
            'href',
            'https://example.com/very/long/path/that/exceeds/twenty/characters',
        )
    })
})
