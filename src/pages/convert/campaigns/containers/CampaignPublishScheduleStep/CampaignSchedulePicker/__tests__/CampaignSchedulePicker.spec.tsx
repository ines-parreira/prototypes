import React from 'react'

import { act, fireEvent, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import moment from 'moment-timezone'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { initialState } from 'state/stats/statsSlice'
import { RootState } from 'state/types'

import CampaignSchedulePicker from '../CampaignSchedulePicker'

const mockStore = configureMockStore([thunk])

describe('CampaignSchedulePicker', () => {
    const defaultState = {
        stats: initialState,
    } as RootState

    it('renders', () => {
        const { getByText } = render(
            <Provider store={mockStore(defaultState)}>
                <CampaignSchedulePicker
                    timezone="UTC"
                    startDate={'2024-09-10'}
                    endDate={null}
                    onChange={jest.fn()}
                />
            </Provider>,
        )

        expect(getByText('From')).toBeInTheDocument()
        expect(getByText('To')).toBeInTheDocument()
    })

    it('renders notice if not end date is not definied', () => {
        const { getByText } = render(
            <Provider store={mockStore(defaultState)}>
                <CampaignSchedulePicker
                    timezone="UTC"
                    startDate={'2024-09-10'}
                    endDate={null}
                    onChange={jest.fn()}
                />
            </Provider>,
        )

        expect(
            getByText(
                /The campaign will run indefinitely if no end date is set./,
            ),
        ).toBeInTheDocument()
    })

    it('end date is definied and user can clear it', () => {
        const onChangeSpy = jest.fn()
        const { getByText, container } = render(
            <Provider store={mockStore(defaultState)}>
                <CampaignSchedulePicker
                    timezone="UTC"
                    startDate={'2024-09-10'}
                    endDate={'2024-09-10'}
                    onChange={onChangeSpy}
                />
            </Provider>,
        )

        const input = container.querySelector(
            'input[name="to"]',
        ) as HTMLInputElement
        expect(input.value).toBe('Sep 10, 2024')
        expect(getByText('cancel')).toBeInTheDocument()

        userEvent.click(getByText('cancel'))

        expect(onChangeSpy).toBeCalledWith(
            expect.objectContaining({
                endDate: null,
            }),
        )
    })

    it('user is able to select start date', () => {
        const onChangeSpy = jest.fn()

        const { getByLabelText, getAllByText, getAllByRole } = render(
            <Provider store={mockStore(defaultState)}>
                <CampaignSchedulePicker
                    timezone="UTC"
                    startDate={'2024-09-10'}
                    endDate={'2024-09-10'}
                    onChange={onChangeSpy}
                />
            </Provider>,
        )

        // Open calendar
        const toggle = getByLabelText(/From/)
        fireEvent.click(toggle)

        // Click the day 21
        const day = getAllByText('21')[0]
        userEvent.click(day)

        // Confirm choice
        const apply = getAllByRole('button', {
            name: 'Apply',
        }).filter((element) => !(element as HTMLButtonElement).disabled)[0]

        fireEvent.click(apply)

        expect(onChangeSpy).toHaveBeenCalledWith({
            startDate: expect.any(moment),
        })
    })

    it('user is able to select end date', () => {
        const onChangeSpy = jest.fn()

        const { getByLabelText, getAllByText, getAllByRole } = render(
            <Provider store={mockStore(defaultState)}>
                <CampaignSchedulePicker
                    timezone="UTC"
                    startDate={'2024-09-10'}
                    endDate={null}
                    onChange={onChangeSpy}
                />
            </Provider>,
        )

        // Open calendar
        const toggle = getByLabelText(/To/)
        act(() => {
            // needed because of useState and toggle
            fireEvent.focus(toggle as Element)
        })

        // Click the day 21
        const day = getAllByText('21')[0]
        userEvent.click(day)

        // Confirm choice
        const apply = getAllByRole('button', {
            name: 'Apply',
        }).filter((element) => !(element as HTMLButtonElement).disabled)[0]

        act(() => {
            fireEvent.click(apply)
        })

        expect(onChangeSpy).toHaveBeenCalledWith({
            endDate: expect.any(moment),
        })
    })
})
