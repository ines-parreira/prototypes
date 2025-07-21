import React from 'react'

import { act, fireEvent, render, screen } from '@testing-library/react'

import ActionsPlatformAuthTypeSelectBox from '../ActionsPlatformAuthTypeSelectBox'

describe('<ActionsPlatformAuthTypeSelectBox />', () => {
    it('should render auth type select box', () => {
        render(
            <ActionsPlatformAuthTypeSelectBox
                value="api-key"
                onChange={jest.fn()}
            />,
        )

        act(() => {
            fireEvent.focus(screen.getByText('API key'))
        })

        expect(screen.getByTestId('floating-overlay')).toBeInTheDocument()
    })

    it('should render disabled auth type select box', () => {
        render(
            <ActionsPlatformAuthTypeSelectBox
                value="api-key"
                onChange={jest.fn()}
                isDisabled
            />,
        )

        act(() => {
            fireEvent.focus(screen.getByText('API key'))
        })

        expect(screen.queryByTestId('floating-overlay')).not.toBeInTheDocument()
    })
})
