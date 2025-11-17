import React from 'react'

import { userEvent } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { BANNER_DETAILS } from '../constants'
import type { FlowsBannerProps } from '../FlowsBanner'
import FlowsBanner from '../FlowsBanner'

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}))

describe('FlowsBanner', () => {
    const mockProps: FlowsBannerProps = {
        isSubscribedToAutomation: true,
        contactFormId: 123,
        shopName: 'example-shop',
    }

    it('renders banner title and description', () => {
        render(<FlowsBanner {...mockProps} />)

        const titleElement = screen.getByText(
            BANNER_DETAILS.CONNECTED_TO_SHOP_AND_AUTOMATION_ENABLED.TITLE,
        )

        expect(titleElement).toBeInTheDocument()
    })

    it('renders banner when AI Agent is not enabled', () => {
        const props = {
            ...mockProps,
            isSubscribedToAutomation: false,
        }

        render(<FlowsBanner {...props} />)

        const titleElement = screen.getByText(
            BANNER_DETAILS.CONNECTED_TO_SHOP_AND_AUTOMATION_DISABLED.TITLE,
        )
        const descriptionElement = screen.getByText(
            BANNER_DETAILS.CONNECTED_TO_SHOP_AND_AUTOMATION_DISABLED
                .DESCRIPTION,
        )

        expect(titleElement).toBeInTheDocument()
        expect(descriptionElement).toBeInTheDocument()
    })

    it('renders banner when shop is not connected', () => {
        const props = {
            ...mockProps,
            shopName: null,
        }

        render(<FlowsBanner {...props} />)

        const titleElement = screen.getByText(
            BANNER_DETAILS.NOT_CONNECTED_TO_SHOP.TITLE,
        )
        const descriptionElement = screen.getByText(
            BANNER_DETAILS.NOT_CONNECTED_TO_SHOP.DESCRIPTION,
        )

        expect(titleElement).toBeInTheDocument()
        expect(descriptionElement).toBeInTheDocument()
    })

    it('navigates to the correct link when button is clicked', () => {
        render(<FlowsBanner {...mockProps} />)

        const buttonElement = screen.getByText(
            BANNER_DETAILS.CONNECTED_TO_SHOP_AND_AUTOMATION_ENABLED.BUTTON_TEXT,
        )
        userEvent.click(buttonElement)

        expect(mockHistoryPush).toHaveBeenCalledWith(
            '/app/automation/shopify/example-shop/flows',
        )
    })
})
