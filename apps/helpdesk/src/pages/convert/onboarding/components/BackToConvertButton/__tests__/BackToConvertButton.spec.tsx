import React from 'react'

import { fireEvent, render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { useBackToConvert } from 'pages/convert/onboarding/hooks/useBackToConvert'
import { assumeMock } from 'utils/testing'

import BackToConvertButton from '../BackToConvertButton'

jest.mock('pages/convert/onboarding/hooks/useBackToConvert')
const useBackToConvertMock = assumeMock(useBackToConvert)

describe('BackToConvertButton', () => {
    test('renders null when backIntegrationId is falsy', () => {
        useBackToConvertMock.mockReturnValue({
            backIntegrationId: '',
            setBackIntegrationId: jest.fn(),
            removeBackIntegrationId: jest.fn(),
        })

        const { container } = render(
            <MemoryRouter>
                <BackToConvertButton />
            </MemoryRouter>,
        )

        expect(container.firstChild).toBeNull()
    })

    test('renders button when backIntegrationId is truthy', () => {
        const removeBackIntegrationId = jest.fn()
        useBackToConvertMock.mockReturnValue({
            backIntegrationId: '123',
            setBackIntegrationId: jest.fn(),
            removeBackIntegrationId: removeBackIntegrationId,
        })

        const { getByText } = render(
            <MemoryRouter>
                <BackToConvertButton />
            </MemoryRouter>,
        )

        expect(getByText('Back To Convert')).toBeInTheDocument()

        fireEvent.click(getByText('Back To Convert'))

        expect(removeBackIntegrationId).toHaveBeenCalled()
    })
})
