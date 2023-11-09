import {fireEvent, screen, waitFor} from '@testing-library/react'
import React from 'react'

import {renderWithRouter} from 'utils/testing'

import ConvertNavbarAddOnPaywallNavbarLink from '../ConvertNavbarAddOnPaywallNavbarLink'

describe('ConvertNavbarAddOnPaywallNavbarLink', () => {
    it('should call callback on button click', async () => {
        const onSubscribeToAddOnClick = jest.fn()

        const {getByText} = renderWithRouter(
            <ConvertNavbarAddOnPaywallNavbarLink
                to="/convert"
                onSubscribeToAddOnClick={onSubscribeToAddOnClick}
            >
                Test label
            </ConvertNavbarAddOnPaywallNavbarLink>
        )

        const iconElement = screen.getByText('arrow_circle_up')
        fireEvent.mouseEnter(iconElement)

        await waitFor(() => {
            const popoverContent = screen.getByText(
                'Subscribe to Convert to unlock this product',
                {
                    exact: false,
                }
            )
            expect(popoverContent).toBeInTheDocument()
        })

        fireEvent.click(getByText('Get Convert'))
        expect(onSubscribeToAddOnClick).toHaveBeenCalled()
    })
})
