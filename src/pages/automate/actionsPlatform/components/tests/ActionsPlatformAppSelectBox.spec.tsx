import React from 'react'
import {act, render, screen, fireEvent} from '@testing-library/react'

import {AppListData} from 'models/integration/types'

import ActionsPlatformAppSelectBox from '../ActionsPlatformAppSelectBox'

describe('<ActionsPlatformAppSelectBox />', () => {
    const app: Pick<AppListData, 'id' | 'name' | 'app_icon'> = {
        app_icon: '/assets/img/integrations/app.png',
        id: 'someid',
        name: 'Test App',
    }

    it('should render app select box', () => {
        const mockOnChange = jest.fn()

        render(
            <ActionsPlatformAppSelectBox apps={[app]} onChange={mockOnChange} />
        )

        act(() => {
            fireEvent.focus(screen.getByText('Select an App'))
        })

        expect(screen.getByTestId('floating-overlay')).toBeInTheDocument()

        act(() => {
            fireEvent.click(screen.getByText('Test App'))
        })

        expect(mockOnChange).toBeCalledWith('someid')
    })

    it('should render app select box value', () => {
        render(
            <ActionsPlatformAppSelectBox
                apps={[app]}
                value={app.id}
                onChange={jest.fn()}
            />
        )

        expect(screen.getByText('Test App')).toBeInTheDocument()
    })

    it('should render disabled app select box', () => {
        render(
            <ActionsPlatformAppSelectBox
                apps={[app]}
                onChange={jest.fn()}
                isDisabled
            />
        )

        act(() => {
            fireEvent.focus(screen.getByText('Select an App'))
        })

        expect(screen.queryByTestId('floating-overlay')).not.toBeInTheDocument()
    })
})
