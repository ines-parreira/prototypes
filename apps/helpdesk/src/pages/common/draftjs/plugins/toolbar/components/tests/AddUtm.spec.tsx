import React from 'react'

import { assumeMock } from '@repo/testing'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import _noop from 'lodash/noop'

import { utmConfiguration } from 'fixtures/utmConfiguration'
import { useCampaignFormContext } from 'pages/convert/campaigns/hooks/useCampaignFormContext'
import { CampaignFormConfigurationType } from 'pages/convert/campaigns/providers/CampaignDetailsForm/configurationContext'

import AddUtm from '../AddUtm'

jest.mock('pages/convert/campaigns/hooks/useCampaignFormContext')
const useCampaignFormContextMock: jest.MockedFunction<
    () => Pick<CampaignFormConfigurationType, 'utmConfiguration'>
> = assumeMock(useCampaignFormContext)

describe('<AddUtm />', () => {
    const defaultProps = {
        onKeyDown: _noop,
        onApply: _noop,
    }

    const defaultContext = utmConfiguration

    beforeEach(() => {
        useCampaignFormContextMock.mockReturnValue({
            utmConfiguration: defaultContext,
        })
    })

    it('calls the callback with the new state when utm querystring changes', () => {
        const mockCallback: jest.Mock<void, [string]> = jest.fn()
        useCampaignFormContextMock.mockReturnValue({
            utmConfiguration: {
                ...defaultContext,
                onUtmQueryStringChange: mockCallback,
            },
        })
        render(<AddUtm {...defaultProps} />)
        const utmQueryStringInput = screen.getByPlaceholderText(
            '?utm_source=Gorgias&utm_medium=ChatCampaign&utm_campaign=campaignName',
        )
        fireEvent.change(utmQueryStringInput, { target: { value: '?foo=bar' } })
        expect(mockCallback).toBeCalledWith('?foo=bar')
    })

    it('calls the callback with the new state when utm enabled changes', () => {
        const mockCallback = jest.fn()
        useCampaignFormContextMock.mockReturnValue({
            utmConfiguration: {
                ...defaultContext,
                onUtmEnabledChange: mockCallback,
            },
        })
        render(<AddUtm {...defaultProps} />)
        screen.getByText('Enable UTM tracking').click()
        expect(mockCallback).toBeCalledWith(false)
    })

    it('calls the correct callback when a apply is clicked', async () => {
        const mockCallback = jest.fn()

        render(<AddUtm {...defaultProps} onApply={mockCallback} />)
        screen.getByText('Apply').click()
        await waitFor(() => expect(mockCallback).toBeCalled())
    })

    it('calls the correct callback when reset is clicked', () => {
        const mockResetCallback = jest.fn()
        useCampaignFormContextMock.mockReturnValue({
            utmConfiguration: {
                ...defaultContext,
                onUtmReset: mockResetCallback,
            },
        })

        render(<AddUtm {...defaultProps} />)
        screen.getByText('Reset').click()
        expect(mockResetCallback).toBeCalled()
    })

    it('uses the onKeyDown callback when Escape is pressed', async () => {
        const mockCallback = jest.fn()
        render(<AddUtm {...defaultProps} onKeyDown={mockCallback} />)
        fireEvent.keyDown(screen.getByLabelText('UTM Tracking'), {
            key: 'Escape',
        })
        await waitFor(() => expect(mockCallback).toBeCalled())
    })

    it('uses the onApply callback when Enter is pressed', async () => {
        const mockCallback = jest.fn()
        render(<AddUtm {...defaultProps} onApply={mockCallback} />)
        act(() => {
            fireEvent.keyDown(screen.getByLabelText('UTM Tracking'), {
                key: 'Enter',
            })
        })
        await waitFor(() => expect(mockCallback).toBeCalled())
    })
})
