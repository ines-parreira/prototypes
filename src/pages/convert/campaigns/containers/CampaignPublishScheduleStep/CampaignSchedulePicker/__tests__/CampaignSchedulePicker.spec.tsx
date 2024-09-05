import React from 'react'

import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import CampaignSchedulePicker from '../CampaignSchedulePicker'

describe('CampaignSchedulePicker', () => {
    it('renders', () => {
        const {getByText} = render(
            <CampaignSchedulePicker
                scheduleConfiguration={{}}
                onChange={jest.fn()}
            />
        )

        expect(getByText('From')).toBeInTheDocument()
        expect(getByText('To')).toBeInTheDocument()
    })

    it('render notice if not end date is not definied', () => {
        const {getByText} = render(
            <CampaignSchedulePicker
                scheduleConfiguration={{}}
                onChange={jest.fn()}
            />
        )

        expect(
            getByText(
                /The campaign will run indefinitely if no end date is set./
            )
        ).toBeInTheDocument()
    })

    it('end date is definied and user can clear it', () => {
        const onChangeSpy = jest.fn()
        const {getByText, getByDisplayValue} = render(
            <CampaignSchedulePicker
                scheduleConfiguration={{
                    endDate: '2024-09-10',
                }}
                onChange={onChangeSpy}
            />
        )

        expect(getByDisplayValue('Sep 10, 2024')).toBeInTheDocument()
        expect(getByText('cancel')).toBeInTheDocument()

        userEvent.click(getByText('cancel'))

        expect(onChangeSpy).toBeCalledWith({endDate: null})
    })
})
