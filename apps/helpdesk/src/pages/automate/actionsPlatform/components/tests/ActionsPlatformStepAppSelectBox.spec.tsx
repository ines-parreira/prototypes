import React from 'react'

import { act, fireEvent, render, screen } from '@testing-library/react'

import { IntegrationType } from 'models/integration/constants'

import type { App } from '../../types'
import ActionsPlatformStepAppSelectBox from '../ActionsPlatformStepAppSelectBox'

describe('<ActionsPlatformStepAppSelectBox />', () => {
    const apps: App[] = [
        {
            icon: '/assets/img/integrations/app.png',
            id: 'someid',
            name: 'Test App',
            type: IntegrationType.App,
        },
        {
            icon: '/assets/img/integrations/shopify.png',
            id: 'shopify',
            name: 'Shopify',
            type: IntegrationType.Shopify,
        },
        {
            icon: '/assets/img/integrations/recharge.png',
            id: 'recharge',
            name: 'Recharge',
            type: IntegrationType.Recharge,
        },
    ]

    it('should render step app select box', () => {
        const mockOnChange = jest.fn()

        render(
            <ActionsPlatformStepAppSelectBox
                apps={apps}
                value={undefined}
                onChange={mockOnChange}
            />,
        )

        act(() => {
            fireEvent.focus(screen.getByText('Select App'))
        })

        expect(screen.getByTestId('floating-overlay')).toBeInTheDocument()

        act(() => {
            fireEvent.click(screen.getByText('Test App'))
        })

        expect(mockOnChange).toBeCalledWith({
            app_id: 'someid',
            type: 'app',
        })
    })

    it('should render disabled step app select box', () => {
        render(
            <ActionsPlatformStepAppSelectBox
                apps={apps}
                value={undefined}
                onChange={jest.fn()}
                isDisabled
            />,
        )

        act(() => {
            fireEvent.focus(screen.getByText('Select App'))
        })

        expect(screen.queryByTestId('floating-overlay')).not.toBeInTheDocument()
    })
})
