import React from 'react'

import { userEvent } from '@repo/testing'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import MaximumCampaignDisplayed from '../MaximumCampaignDisplayed'

describe('<MaximumCampaignDisplayed />', () => {
    const defaultProps = {
        config: undefined,
        onChange: jest.fn(),
        defaultValue: 3,
        minValue: 5,
        maxValue: 50,
    }
    it('renders', () => {
        render(<MaximumCampaignDisplayed {...defaultProps} />)

        expect(
            screen.getByText('Maximum campaign displays'),
        ).toBeInTheDocument()
    })

    it('feature is enabled', () => {
        render(
            <MaximumCampaignDisplayed
                {...{
                    ...defaultProps,
                    config: { value: 30 },
                }}
            />,
        )

        const toggleInput = screen.getByRole('checkbox')
        expect(toggleInput).toBeChecked()
    })

    it('user can toggle on feature', async () => {
        const onChangeMock = jest.fn()
        render(
            <MaximumCampaignDisplayed
                {...{
                    ...defaultProps,
                    onChange: onChangeMock,
                }}
            />,
        )

        const toggleInput = screen.getByRole('checkbox')

        act(() => {
            fireEvent.click(toggleInput)
        })

        await waitFor(() => {
            expect(onChangeMock).toHaveBeenCalledWith({ value: 3 })
        })
    })

    it('user can modify values', async () => {
        const onChangeMock = jest.fn()
        const { container } = render(
            <MaximumCampaignDisplayed
                {...{
                    ...defaultProps,
                    onChange: onChangeMock,
                }}
            />,
        )

        const toggleInput = screen.getByRole('checkbox')
        act(() => {
            fireEvent.click(toggleInput)
        })

        const valueInput = container.querySelector(
            'input[type="number"]',
        ) as Element

        userEvent.clear(valueInput)
        await userEvent.type(valueInput, '8')

        expect(onChangeMock).toHaveBeenCalledWith({
            value: 8,
        })
    })
})
