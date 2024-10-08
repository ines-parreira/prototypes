import React from 'react'
import {render, screen, fireEvent, act} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import MaximumCampaignDisplayed from '../MaximumCampaignDisplayed'

describe('<MaximumCampaignDisplayed />', () => {
    it('renders', () => {
        render(
            <MaximumCampaignDisplayed config={undefined} onChange={jest.fn()} />
        )

        expect(
            screen.getByText('Maximum campaign display in a session')
        ).toBeInTheDocument()
    })

    it('feature is enabled', () => {
        render(
            <MaximumCampaignDisplayed
                config={{value: 30}}
                onChange={jest.fn()}
            />
        )

        const toggleInput = screen.getByRole('checkbox')
        expect(toggleInput).toBeChecked()
    })

    it('user can toggle on feature', () => {
        const onChangeMock = jest.fn()
        render(
            <MaximumCampaignDisplayed
                config={undefined}
                onChange={onChangeMock}
            />
        )

        const toggleInput = screen.getByRole('checkbox')

        act(() => {
            fireEvent.click(toggleInput)
        })

        expect(onChangeMock).toHaveBeenCalledWith({value: 3})
    })

    it('user can modify values', async () => {
        const onChangeMock = jest.fn()
        const {container} = render(
            <MaximumCampaignDisplayed
                config={undefined}
                onChange={onChangeMock}
            />
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
        })
    })
})
