import React from 'react'

import { act, fireEvent, render, screen } from '@testing-library/react'

import { CampaignDeviceType } from '../CampaignDeviceType'

describe('<CampaignDeviceType />', () => {
    describe('campaign prioritization enabled', () => {
        it('renders', () => {
            render(
                <CampaignDeviceType trigger={undefined} onChange={jest.fn()} />,
            )

            expect(screen.getByText('Device type')).toBeInTheDocument()

            act(() => {
                fireEvent.focus(document.getElementsByTagName('input')[0])
            })

            expect(screen.getByText('Only mobile')).toBeInTheDocument()
        })
    })
})
