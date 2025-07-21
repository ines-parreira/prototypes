import React from 'react'

import { act, fireEvent, render, screen } from '@testing-library/react'

import ActionsPlatformAppsTableRow from '../ActionsPlatformAppsTableRow'

describe('<ActionsPlatformAppsTableRow />', () => {
    it('should render Actions app row', () => {
        render(
            <ActionsPlatformAppsTableRow
                app={{
                    icon: '/assets/img/integrations/app.png',
                    name: 'App 1',
                }}
                actionsApp={{
                    id: 'someid',
                    auth_type: 'api-key',
                }}
                onClick={jest.fn()}
            />,
        )

        expect(screen.getByText('App 1')).toBeInTheDocument()
        expect(screen.getByTitle('App 1')).toHaveAttribute(
            'src',
            '/assets/img/integrations/app.png',
        )
        expect(screen.getByText('API key')).toBeInTheDocument()
    })

    it('should default to Actions app id if app is undefined', () => {
        render(
            <ActionsPlatformAppsTableRow
                app={undefined}
                actionsApp={{
                    id: 'someid',
                    auth_type: 'api-key',
                }}
                onClick={jest.fn()}
            />,
        )

        expect(screen.queryByText('App 1')).not.toBeInTheDocument()
        expect(screen.getByText('someid')).toBeInTheDocument()
        expect(screen.getByText('API key')).toBeInTheDocument()
    })

    it('should trigger onClick handle on click', () => {
        const mockOnClick = jest.fn()

        render(
            <ActionsPlatformAppsTableRow
                app={{
                    icon: '/assets/img/integrations/app.png',
                    name: 'App 1',
                }}
                actionsApp={{
                    id: 'someid',
                    auth_type: 'api-key',
                }}
                onClick={mockOnClick}
            />,
        )

        act(() => {
            fireEvent.click(screen.getByText('App 1'))
        })

        expect(mockOnClick).toHaveBeenCalled()
    })
})
