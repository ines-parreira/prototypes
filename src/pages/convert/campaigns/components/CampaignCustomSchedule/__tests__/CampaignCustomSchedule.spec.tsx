import React from 'react'

import { fireEvent, render } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

import { userEvent } from 'utils/testing/userEvent'

import CampaignCustomSchedule from '../CampaignCustomSchedule'

describe('<CampaignCustomSchedule />', () => {
    it('should render', () => {
        const { getByText } = render(
            <CampaignCustomSchedule customSchedule={[]} onChange={jest.fn()} />,
        )

        expect(getByText('Add Date-Specific Hours')).toBeInTheDocument()
    })

    it('user is able to add a new custom schedule', () => {
        const onChangeSpy = jest.fn()
        const { getByText } = render(
            <CampaignCustomSchedule
                customSchedule={[]}
                onChange={onChangeSpy}
            />,
        )

        act(() => {
            userEvent.click(getByText('Add Date-Specific Hours'))
        })

        expect(onChangeSpy).toBeCalledWith([
            { days: '1', from_time: '09:00', to_time: '17:00' },
        ])
    })

    it('user is able to remove added custom schedule', () => {
        const onChangeSpy = jest.fn()
        const { getAllByRole, container } = render(
            <CampaignCustomSchedule
                customSchedule={[
                    { days: '1', from_time: '09:00', to_time: '05:00' },
                    { days: '2', from_time: '09:00', to_time: '05:00' },
                ]}
                onChange={onChangeSpy}
            />,
        )

        expect(container.querySelectorAll(`.formLine`)).toHaveLength(2)

        // Remove the entry line
        act(() => {
            userEvent.click(getAllByRole('button', { name: /clear/i })[0])
        })

        expect(onChangeSpy).toBeCalledWith([
            { days: '2', from_time: '09:00', to_time: '05:00' },
        ])
    })

    it('user is able to update custom schedule', () => {
        const onChangeSpy = jest.fn()
        const { getByText } = render(
            <CampaignCustomSchedule
                customSchedule={[
                    { days: '2', from_time: '09:00', to_time: '05:00' },
                ]}
                onChange={onChangeSpy}
            />,
        )

        act(() => {
            fireEvent.focus(getByText('Tuesday'))
            fireEvent.click(getByText('Monday'))
        })

        expect(onChangeSpy).toBeCalledWith([
            { days: '1', from_time: '09:00', to_time: '05:00' },
        ])
    })

    it('user cannot create more than 7 entries', () => {
        const onChangeSpy = jest.fn()

        const customSchedule = []
        for (let i = 0; i < 7; i++) {
            customSchedule.push({
                days: '2',
                from_time: '09:00',
                to_time: '05:00',
            })
        }

        const { getByText, container } = render(
            <CampaignCustomSchedule
                customSchedule={customSchedule}
                onChange={onChangeSpy}
            />,
        )

        act(() => {
            userEvent.click(getByText('Add Date-Specific Hours'))
        })

        expect(onChangeSpy).toHaveBeenCalledTimes(0)
        expect(container.querySelectorAll(`.formLine`)).toHaveLength(7)
    })
})
