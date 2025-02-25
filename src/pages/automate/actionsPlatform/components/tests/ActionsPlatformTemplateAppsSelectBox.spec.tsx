import React from 'react'

import { act, fireEvent, render, screen, within } from '@testing-library/react'

import { IntegrationType } from 'models/integration/constants'

import { App } from '../../types'
import ActionsPlatformTemplateAppsSelectBox from '../ActionsPlatformTemplateAppsSelectBox'

describe('<ActionsPlatformTemplateAppsSelectBox />', () => {
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

    it('should render template apps select box', () => {
        const mockOnChange = jest.fn()

        render(
            <ActionsPlatformTemplateAppsSelectBox
                apps={apps}
                value={[]}
                onChange={mockOnChange}
            />,
        )

        act(() => {
            fireEvent.focus(screen.getByText('Select App(s)'))
        })

        expect(screen.getByTestId('floating-overlay')).toBeInTheDocument()

        act(() => {
            fireEvent.click(screen.getByText('Test App'))
        })

        expect(mockOnChange).toBeCalledWith([
            {
                app_id: 'someid',
                type: 'app',
            },
        ])
    })

    it('should allow to select Shopify app and non-Shopify app', () => {
        const mockOnChange = jest.fn()

        const { rerender } = render(
            <ActionsPlatformTemplateAppsSelectBox
                apps={apps}
                value={[]}
                onChange={mockOnChange}
            />,
        )

        act(() => {
            fireEvent.focus(screen.getByText('Select App(s)'))
        })

        expect(screen.getByTestId('floating-overlay')).toBeInTheDocument()

        act(() => {
            fireEvent.click(screen.getByText('Test App'))
        })

        expect(mockOnChange).toHaveBeenNthCalledWith(1, [
            {
                app_id: 'someid',
                type: 'app',
            },
        ])

        rerender(
            <ActionsPlatformTemplateAppsSelectBox
                apps={apps}
                value={[
                    {
                        app_id: 'someid',
                        type: 'app',
                    },
                ]}
                onChange={mockOnChange}
            />,
        )

        act(() => {
            fireEvent.click(screen.getByText('Shopify'))
        })

        expect(mockOnChange).toHaveBeenNthCalledWith(2, [
            {
                app_id: 'someid',
                type: 'app',
            },
            {
                type: 'shopify',
            },
        ])
    })

    it('should not allow to select 2 non-Shopify apps', () => {
        const mockOnChange = jest.fn()

        render(
            <ActionsPlatformTemplateAppsSelectBox
                apps={apps}
                value={[
                    {
                        app_id: 'someid',
                        type: 'app',
                    },
                ]}
                onChange={mockOnChange}
            />,
        )

        act(() => {
            fireEvent.focus(screen.getByText('Test App'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Recharge'))
        })

        expect(mockOnChange).not.toBeCalled()
    })

    it('should render disabled template apps select box', () => {
        render(
            <ActionsPlatformTemplateAppsSelectBox
                apps={apps}
                value={[]}
                onChange={jest.fn()}
                isDisabled
            />,
        )

        act(() => {
            fireEvent.focus(screen.getByText('Select App(s)'))
        })

        expect(screen.queryByTestId('floating-overlay')).not.toBeInTheDocument()
    })

    it('should allow to deselect non-native app', () => {
        const mockOnChange = jest.fn()

        render(
            <ActionsPlatformTemplateAppsSelectBox
                apps={apps}
                value={[
                    {
                        app_id: 'someid',
                        type: 'app',
                    },
                ]}
                onChange={mockOnChange}
            />,
        )

        act(() => {
            fireEvent.focus(screen.getByText('Test App'))
        })

        act(() => {
            fireEvent.click(
                within(screen.getByTestId('floating-overlay')).getByText(
                    'Test App',
                ),
            )
        })

        expect(mockOnChange).toBeCalledWith([])
    })

    it('should allow to deselect Shopify app', () => {
        const mockOnChange = jest.fn()

        render(
            <ActionsPlatformTemplateAppsSelectBox
                apps={apps}
                value={[
                    {
                        type: 'shopify',
                    },
                ]}
                onChange={mockOnChange}
            />,
        )

        act(() => {
            fireEvent.focus(screen.getByText('Shopify'))
        })

        act(() => {
            fireEvent.click(
                within(screen.getByTestId('floating-overlay')).getByText(
                    'Shopify',
                ),
            )
        })

        expect(mockOnChange).toBeCalledWith([])
    })

    it('should allow to select & deselect native app', () => {
        const mockOnChange = jest.fn()

        const { rerender } = render(
            <ActionsPlatformTemplateAppsSelectBox
                apps={apps}
                value={[]}
                onChange={mockOnChange}
            />,
        )

        act(() => {
            fireEvent.focus(screen.getByText('Select App(s)'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Recharge'))
        })

        expect(mockOnChange).toHaveBeenNthCalledWith(1, [
            {
                type: 'recharge',
            },
        ])

        rerender(
            <ActionsPlatformTemplateAppsSelectBox
                apps={apps}
                value={[{ type: 'recharge' }]}
                onChange={mockOnChange}
            />,
        )

        act(() => {
            fireEvent.click(
                within(screen.getByTestId('floating-overlay')).getByText(
                    'Recharge',
                ),
            )
        })

        expect(mockOnChange).toHaveBeenNthCalledWith(2, [])
    })
})
