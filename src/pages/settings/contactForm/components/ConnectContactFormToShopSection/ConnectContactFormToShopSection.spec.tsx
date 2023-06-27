import {render, screen} from '@testing-library/react'
import React from 'react'
import userEvent from '@testing-library/user-event'
import {useShopifyStoreWithChatConnectionsOptions} from '../../../helpCenter/hooks/useShopifyStoreWithChatConnectionsOptions'
import {ConnectContactFormToShopSection} from './ConnectContactFormToShopSection'

jest.mock(
    'pages/settings/helpCenter/hooks/useShopifyStoreWithChatConnectionsOptions'
)

const mockedUseShopifyStoreWithChatConnectionsOptions = jest.mocked(
    useShopifyStoreWithChatConnectionsOptions
)

const renderComponent = (
    props: Partial<React.ComponentProps<typeof ConnectContactFormToShopSection>>
) => {
    return render(
        <ConnectContactFormToShopSection
            shopName={null}
            onUpdate={() => {
                return
            }}
            {...props}
        />
    )
}

describe('<ConnectContactFormToShopSection />', () => {
    beforeEach(() => {
        mockedUseShopifyStoreWithChatConnectionsOptions.mockReset()
    })

    it('should render component', () => {
        renderComponent({})

        expect(screen.getByLabelText('Connect a store')).toBeInTheDocument()
    })

    it('should disable form when shop name exist', () => {
        mockedUseShopifyStoreWithChatConnectionsOptions.mockReturnValue([
            {
                value: 'gorgiastest',
                label: 'gorgiastest',
                text: 'gorgiastest',
            },
        ])

        renderComponent({shopName: 'gorgiastest'})

        expect(screen.getByText('gorgiastest')).toBeInTheDocument()
        expect(screen.getByLabelText('Connect a store')).toBeDisabled()
    })

    it('should update the shop name if selected', () => {
        const fakeOnUpdate = jest.fn()
        mockedUseShopifyStoreWithChatConnectionsOptions.mockReturnValue([
            {
                value: 'gorgiastest',
                label: 'gorgiastest',
                text: 'gorgiastest',
            },
        ])

        renderComponent({shopName: null, onUpdate: fakeOnUpdate})

        userEvent.click(screen.getByLabelText('Connect a store'))

        userEvent.click(screen.getByText('gorgiastest'))

        expect(screen.getByText('gorgiastest')).toBeInTheDocument()
        expect(fakeOnUpdate).toHaveBeenCalledWith({shop_name: 'gorgiastest'})
    })
})
