import {fireEvent, render, screen, act} from '@testing-library/react'
import React from 'react'

import useIsCampaignProritizationEnabled from 'pages/convert/common/hooks/useIsCampaignProritizationEnabled'
import {assumeMock} from 'utils/testing'

import {CampaignDeviceType} from '../CampaignDeviceType'

jest.mock('pages/convert/common/hooks/useIsCampaignProritizationEnabled')
const useIsCampaignProritizationEnabledMock = assumeMock(
    useIsCampaignProritizationEnabled
)

describe('<CampaignDeviceType />', () => {
    describe('campaign prioritization enabled', () => {
        beforeEach(() => {
            useIsCampaignProritizationEnabledMock.mockImplementation(() => true)
        })

        it('renders', () => {
            render(
                <CampaignDeviceType trigger={undefined} onChange={jest.fn()} />
            )

            expect(screen.getByText('Device type')).toBeInTheDocument()

            act(() => {
                fireEvent.focus(document.getElementsByTagName('input')[0])
            })

            expect(screen.getByText('Only mobile')).toBeInTheDocument()
        })
    })

    describe('campaign prioritization disabled', () => {
        beforeEach(() => {
            useIsCampaignProritizationEnabledMock.mockImplementation(
                () => false
            )
        })

        it('renders', () => {
            render(
                <CampaignDeviceType trigger={undefined} onChange={jest.fn()} />
            )

            expect(screen.getByText('Device type')).toBeInTheDocument()
            expect(screen.getByLabelText('Only mobile')).toBeInTheDocument()
        })
    })
})
