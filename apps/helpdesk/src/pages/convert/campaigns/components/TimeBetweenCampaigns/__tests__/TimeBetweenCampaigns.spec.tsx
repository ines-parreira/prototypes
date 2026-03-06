import React from 'react'

import { userEvent } from '@repo/testing'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import TimeBetweenCampaigns from '../TimeBetweenCampaigns'

describe('<MaximumCampaignDisplayed />', () => {
    const defaultProps = {
        config: undefined,
        onChange: jest.fn(),
        minValue: 0,
        maxValue: 60,
    }

    it('renders', () => {
        render(<TimeBetweenCampaigns {...defaultProps} />)

        expect(
            screen.getByText('Time between campaign displays'),
        ).toBeInTheDocument()
    })

    it('feature is enabled', () => {
        render(
            <TimeBetweenCampaigns
                {...{
                    ...defaultProps,
                    config: {
                        value: 30,
                        unit: 'seconds',
                    },
                }}
            />,
        )

        const toggleInput = screen.getByRole('checkbox')
        expect(toggleInput).toBeChecked()
    })

    it('user can toggle on feature', () => {
        const onChangeMock = jest.fn()
        render(
            <TimeBetweenCampaigns
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

        expect(onChangeMock).toHaveBeenCalledWith({
            unit: 'seconds',
            value: 30,
        })
    })

    it('user can modify values', async () => {
        const onChangeMock = jest.fn()
        const { container } = render(
            <TimeBetweenCampaigns
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
            unit: 'seconds',
        })
    })

    it('user can modify values from seconcs to minutes', async () => {
        const onChangeMock = jest.fn()

        render(
            <TimeBetweenCampaigns
                {...{
                    ...defaultProps,
                    onChange: onChangeMock,
                    config: {
                        value: 60,
                        unit: 'seconds',
                    },
                }}
            />,
        )

        const input = screen.getByRole('textbox')
        fireEvent.focus(input)

        const minuteOption = screen.getByText('Minutes')
        fireEvent.click(minuteOption)

        await waitFor(() => {
            expect(onChangeMock).toHaveBeenCalledWith({
                value: 1,
                unit: 'minutes',
            })
        })
    })

    it('user can modify values from minutes to secons', async () => {
        const onChangeMock = jest.fn()

        render(
            <TimeBetweenCampaigns
                {...{
                    ...defaultProps,
                    onChange: onChangeMock,
                    config: {
                        value: 1,
                        unit: 'minutes',
                    },
                }}
            />,
        )

        const input = screen.getByRole('textbox')
        fireEvent.focus(input)

        const minuteOption = screen.getByText('Seconds')
        fireEvent.click(minuteOption)

        await waitFor(() => {
            expect(onChangeMock).toHaveBeenCalledWith({
                value: 60,
                unit: 'seconds',
            })
        })
    })

    it('shoud show error when value is out of range', async () => {
        const onChangeMock = jest.fn()

        const { container } = render(
            <TimeBetweenCampaigns
                {...{
                    ...defaultProps,
                    onChange: onChangeMock,
                    config: {
                        value: 1,
                        unit: 'seconds',
                    },
                }}
            />,
        )

        const valueInput = container.querySelector(
            'input[type="number"]',
        ) as Element

        userEvent.clear(valueInput)
        await userEvent.type(valueInput, '80')

        expect(onChangeMock).not.toHaveBeenCalledWith({
            value: 80,
            unit: 'seconds',
        })
        expect(
            screen.getByText('Value should be between 0 and 60 seconds'),
        ).toBeInTheDocument()
    })
})
