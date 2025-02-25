import React from 'react'

import { fireEvent, render } from '@testing-library/react'

import BundleManualInstallationCard from '../BundleManualInstallationCard'

describe('BundleManualInstallationCard', () => {
    test('renders correctly with default props', () => {
        const { getByText } = render(
            <BundleManualInstallationCard
                isConnected={false}
                isBordered={false}
                isConnectedToShopify={false}
            />,
        )

        expect(getByText('Manual installation')).toBeInTheDocument()
        expect(getByText(/Install the campaign bundle on/)).toBeInTheDocument()
        expect(getByText('Shopify Website')).toBeInTheDocument()
        expect(getByText('Any Other Website')).toBeInTheDocument()
    })

    test('switches tabs when tab item is clicked', () => {
        const { getByText } = render(
            <BundleManualInstallationCard
                isConnected={false}
                isBordered={false}
                isConnectedToShopify={false}
            />,
        )

        fireEvent.click(getByText('Any Other Website'))
        expect(
            getByText('Any Other Website').classList.contains('isActive'),
        ).toBe(true)
    })
})
