import React from 'react'
import {render, screen} from '@testing-library/react'

import SyncNotification from '../SyncNotification'

describe('<SyncNotification/>', () => {
    afterEach(() => {
        localStorage.clear()
    })

    it('should show progress notification', () => {
        render(
            <SyncNotification
                platform={'Shopify'}
                shopName={'Very Good Shop'}
                isSyncComplete={false}
            />
        )

        expect(screen.getByText(/Import in progress/))
    })

    it('should show completed notification', () => {
        render(
            <SyncNotification
                platform={'Shopify'}
                shopName={'Very Good Shop'}
                isSyncComplete={true}
            />
        )

        expect(screen.getByText(/Import complete/))
    })

    it('should render null if sync is completed and notification was dismissed', () => {
        localStorage.setItem(
            `Shopify_Very Good Shop_sync_notification`,
            JSON.stringify(true)
        )

        const {container} = render(
            <SyncNotification
                platform={'Shopify'}
                shopName={'Very Good Shop'}
                isSyncComplete={true}
            />
        )

        expect(container.firstChild).toBeNull()
    })
})
