import { fireEvent, render, screen } from '@testing-library/react'

import { VoiceQueueIntegration } from '@gorgias/api-queries'

import { NewPhoneNumber } from 'models/phoneNumber/types'
import { NewPhoneNumbersState } from 'state/entities/phoneNumbers/types'
import { assumeMock } from 'utils/testing'

import usePhoneNumbers from '../phone/usePhoneNumbers'
import VoiceQueueSettingsLinkedIntegrations from './VoiceQueueSettingsLinkedIntegrations'

jest.mock('../phone/usePhoneNumbers')

const usePhoneNumbersMock = assumeMock(usePhoneNumbers)

const renderComponent = ({
    integrations,
}: {
    integrations: VoiceQueueIntegration[]
}) => {
    return render(
        <VoiceQueueSettingsLinkedIntegrations integrations={integrations} />,
    )
}

describe('VoiceQueueSettingsLinkedIntegrations', () => {
    const mockIntegrations: VoiceQueueIntegration[] = [
        {
            id: 1,
            account_id: 1,
            name: 'Test Integration 1',
            meta: {
                phone_number_id: 123,
            },
        },
        {
            id: 2,
            account_id: 1,
            name: 'Test Integration 2',
            meta: {
                phone_number_id: 456,
            },
        },
    ]

    const mockPhoneNumber: NewPhoneNumber = {
        id: 123,
        phone_number: '+15551234567',
        phone_number_friendly: '+1 (555) 123-4567',
    } as any

    const mockPhoneNumbersState: NewPhoneNumbersState = {
        123: mockPhoneNumber,
        456: {
            ...mockPhoneNumber,
            id: 456,
            phone_number_friendly: '+1 (555) 987-6543',
        },
    }

    const mockPhoneNumbers = {
        phoneNumbers: mockPhoneNumbersState,
        getPhoneNumberById: (id: number): NewPhoneNumber =>
            mockPhoneNumbersState[id],
    }

    beforeEach(() => {
        usePhoneNumbersMock.mockReturnValue(mockPhoneNumbers)
    })

    it('renders the component with initial state', () => {
        renderComponent({ integrations: mockIntegrations })

        expect(
            screen.getByText('Connected phone integrations'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'View and manage the phone integrations connected to this queue.',
            ),
        ).toBeInTheDocument()
        expect(screen.getByText('show integrations')).toBeInTheDocument()
        expect(screen.queryByText('Test Integration 1')).not.toBeInTheDocument()
    })

    it('shows integrations when show integrations button is clicked', () => {
        renderComponent({ integrations: mockIntegrations })

        const showButton = screen.getByText('show integrations')
        fireEvent.click(showButton)

        expect(screen.getByText('Test Integration 1')).toBeInTheDocument()
        expect(screen.getByText('Test Integration 2')).toBeInTheDocument()
        expect(screen.getByText('+1 (555) 123-4567')).toBeInTheDocument()
        expect(screen.getByText('+1 (555) 987-6543')).toBeInTheDocument()
        expect(screen.getByText('hide integrations')).toBeInTheDocument()
    })

    it('hides integrations when hide integrations button is clicked', () => {
        renderComponent({ integrations: mockIntegrations })

        const showButton = screen.getByText('show integrations')
        fireEvent.click(showButton)

        const hideButton = screen.getByText('hide integrations')
        fireEvent.click(hideButton)

        expect(screen.queryByText('Test Integration 1')).not.toBeInTheDocument()
        expect(screen.queryByText('Test Integration 2')).not.toBeInTheDocument()
        expect(screen.getByText('show integrations')).toBeInTheDocument()
    })

    it('renders manage integration buttons with correct links', () => {
        renderComponent({ integrations: mockIntegrations })

        const showButton = screen.getByText('show integrations')
        fireEvent.click(showButton)

        const manageButtons = screen.getAllByText('Manage integration')
        expect(manageButtons).toHaveLength(2)

        const firstButton = manageButtons[0]
        expect(firstButton.closest('a')).toHaveAttribute(
            'href',
            '/app/settings/channels/phone/1/preferences',
        )
    })

    it('handles case when phone number is not found', () => {
        usePhoneNumbersMock.mockReturnValue({
            getPhoneNumberById: (): NewPhoneNumber => null as any,
        } as any)

        renderComponent({ integrations: mockIntegrations })

        const showButton = screen.getByText('show integrations')
        fireEvent.click(showButton)

        expect(screen.getByText('Test Integration 1')).toBeInTheDocument()
        expect(screen.queryByText('+1 (555) 123-4567')).not.toBeInTheDocument()
    })
})
