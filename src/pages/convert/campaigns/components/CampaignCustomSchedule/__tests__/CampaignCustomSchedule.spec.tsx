import React from 'react'

import {render} from '@testing-library/react'
import {act} from 'react-dom/test-utils'
import userEvent from '@testing-library/user-event'

import CampaignCustomSchedule from '../CampaignCustomSchedule'

describe('<CampaignCustomSchedule />', () => {
    it('should render', () => {
        const {getByText} = render(<CampaignCustomSchedule />)

        expect(getByText('Add Date-Specific Hours')).toBeInTheDocument()
    })

    it('user is able to add a new custom schedule', () => {
        const {getByText} = render(<CampaignCustomSchedule />)

        act(() => {
            userEvent.click(getByText('Add Date-Specific Hours'))
        })

        expect(getByText('Monday')).toBeInTheDocument()
    })

    it('user is able to remove added custom schedule', () => {
        const {getByText, container, getAllByRole} = render(
            <CampaignCustomSchedule />
        )

        act(() => {
            userEvent.click(getByText('Add Date-Specific Hours'))
        })

        expect(container.querySelectorAll(`.formLine`)).toHaveLength(1)

        act(() => {
            userEvent.click(getByText('Add Date-Specific Hours'))
        })

        expect(container.querySelectorAll(`.formLine`)).toHaveLength(2)

        // Remove the entry line
        act(() => {
            userEvent.click(getAllByRole('button', {name: /clear/i})[0])
        })

        expect(container.querySelectorAll(`.formLine`)).toHaveLength(1)
    })

    it('user is able to update custom schedule', () => {
        const onChangeSpy = jest.fn()
        const {getByText} = render(
            <CampaignCustomSchedule onChange={onChangeSpy} />
        )

        act(() => {
            userEvent.click(getByText('Add Date-Specific Hours'))
        })

        act(() => {
            userEvent.click(getByText('Tuesday'))
        })

        expect(onChangeSpy).toHaveBeenCalledTimes(2)
    })

    it('user cannot create more than 7 entries', () => {
        const {getByText, container} = render(<CampaignCustomSchedule />)
        for (let i = 0; i < 10; i++) {
            act(() => {
                userEvent.click(getByText('Add Date-Specific Hours'))
            })
        }

        expect(container.querySelectorAll(`.formLine`)).toHaveLength(7)
    })
})
