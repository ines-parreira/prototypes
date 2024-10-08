import React from 'react'
import {render, screen, fireEvent, act} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import TimeBetweenCampaigns from '../TimeBetweenCampaigns'

describe('<MaximumCampaignDisplayed />', () => {
    it('renders', () => {
        render(<TimeBetweenCampaigns config={undefined} onChange={jest.fn()} />)

        expect(
            screen.getByText('Time required between campaigns')
        ).toBeInTheDocument()
    })

    it('feature is enabled', () => {
        render(
            <TimeBetweenCampaigns
                config={{value: 30, unit: 'seconds'}}
                onChange={jest.fn()}
            />
        )

        const toggleInput = screen.getByRole('checkbox')
        expect(toggleInput).toBeChecked()
    })

    it('user can toggle on feature', () => {
        const onChangeMock = jest.fn()
        render(
            <TimeBetweenCampaigns config={undefined} onChange={onChangeMock} />
        )

        const toggleInput = screen.getByRole('checkbox')

        act(() => {
            fireEvent.click(toggleInput)
        })

        expect(onChangeMock).toHaveBeenCalledWith({unit: 'seconds', value: 30})
    })

    it('user can modify values', async () => {
        const onChangeMock = jest.fn()
        const {container} = render(
            <TimeBetweenCampaigns config={undefined} onChange={onChangeMock} />
        )

        const toggleInput = screen.getByRole('checkbox')
        act(() => {
            fireEvent.click(toggleInput)
        })

        const valueInput = container.querySelector(
            'input[type="number"]'
        ) as Element

        userEvent.clear(valueInput)
        await userEvent.type(valueInput, '8')

        expect(onChangeMock).toHaveBeenCalledWith({
            value: 8,
            unit: 'seconds',
        })
    })
})
