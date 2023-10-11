import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import React from 'react'
import ConvertNavbarAddOnPaywallNavbarLink from '../ConvertNavbarAddOnPaywallNavbarLink'

describe('ConvertNavbarAddOnPaywallNavbarLink', () => {
    it('should call callback on button click', async () => {
        const onSubscribeToAddOnClick = jest.fn()

        const {getByText} = render(
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
            const popoverContent = screen.getByText('Subscribe to the', {
                exact: false,
            })
            expect(popoverContent).toBeInTheDocument()
        })

        fireEvent.click(getByText('Get This Feature'))
        expect(onSubscribeToAddOnClick).toHaveBeenCalled()
    })
})
