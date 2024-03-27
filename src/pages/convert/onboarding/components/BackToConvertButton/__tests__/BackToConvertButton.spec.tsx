import React from 'react'
import {render, fireEvent} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import {useBackToConvert} from 'pages/convert/onboarding/hooks/useBackToConvert'
import {useIsConvertOnboardingUiEnabled} from 'pages/convert/common/hooks/useIsConvertOnboardingUiEnabled'
import {assumeMock} from 'utils/testing'
import BackToConvertButton from '../BackToConvertButton'

jest.mock('pages/convert/onboarding/hooks/useBackToConvert')
const useBackToConvertMock = assumeMock(useBackToConvert)

jest.mock('pages/convert/common/hooks/useIsConvertOnboardingUiEnabled')
const useIsConvertOnboardingUiEnabledMock = assumeMock(
    useIsConvertOnboardingUiEnabled
)

describe('BackToConvertButton', () => {
    test('renders null when backIntegrationId is falsy or convert onboarding UI is disabled', () => {
        useBackToConvertMock.mockReturnValue({
            backIntegrationId: '',
            setBackIntegrationId: jest.fn(),
            removeBackIntegrationId: jest.fn(),
        })
        useIsConvertOnboardingUiEnabledMock.mockReturnValue(false)

        const {container} = render(
            <MemoryRouter>
                <BackToConvertButton />
            </MemoryRouter>
        )

        expect(container.firstChild).toBeNull()
    })

    test('renders button when backIntegrationId is truthy and convert onboarding UI is enabled', () => {
        const removeBackIntegrationId = jest.fn()
        useBackToConvertMock.mockReturnValue({
            backIntegrationId: '123',
            setBackIntegrationId: jest.fn(),
            removeBackIntegrationId: removeBackIntegrationId,
        })
        useIsConvertOnboardingUiEnabledMock.mockReturnValue(true)

        const {getByText} = render(
            <MemoryRouter>
                <BackToConvertButton />
            </MemoryRouter>
        )

        expect(getByText('Back To Convert')).toBeInTheDocument()

        fireEvent.click(getByText('Back To Convert'))

        expect(removeBackIntegrationId).toHaveBeenCalled()
    })
})
