import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import {
    GORGIAS_CHAT_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE,
} from 'constants/integration'

import { ConvertBundleDetail } from '../ConvertBundleDetail'

describe('ConvertBundleDetail', () => {
    beforeEach(() => {})
    it('renders chat integration details if provided', () => {
        render(
            <ConvertBundleDetail
                isConnectedToShopify={true}
                isThemeAppExtensionInstallation={false}
                chatIntegration={fromJS({
                    id: 1,
                    name: 'Test Chat Integration',
                    type: GORGIAS_CHAT_INTEGRATION_TYPE,
                    meta: {
                        shop_integration_id: 123,
                    },
                })}
            />,
        )

        expect(screen.getByText(/Test Chat Integration/)).toBeInTheDocument()
        expect(screen.getByText(/Manage Chat/)).toBeInTheDocument()
    })

    it('renders store integration details if provided', () => {
        render(
            <ConvertBundleDetail
                isConnectedToShopify={true}
                isThemeAppExtensionInstallation={false}
                storeIntegration={fromJS({
                    id: 1,
                    name: 'Test Store Integration',
                    type: SHOPIFY_INTEGRATION_TYPE,
                })}
            />,
        )

        expect(screen.getByText(/Test Store Integration/)).toBeInTheDocument()
    })

    it('renders campaign bundle installation method section', () => {
        render(
            <ConvertBundleDetail
                isConnectedToShopify={false}
                isThemeAppExtensionInstallation={false}
            />,
        )

        expect(
            screen.getByText(/Campaign bundle installation method/),
        ).toBeInTheDocument()
        expect(
            screen.getByText(/Installing the campaign bundle is required/),
        ).toBeInTheDocument()
    })
})
