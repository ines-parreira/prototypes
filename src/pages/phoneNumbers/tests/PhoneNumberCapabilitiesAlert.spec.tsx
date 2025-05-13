import { render, screen } from '@testing-library/react'

import * as capabilitiesHook from 'hooks/integrations/phone/usePhoneNumberCapabilities'
import { PhoneCountry, PhoneType } from 'models/phoneNumber/types'
import { assumeMock } from 'utils/testing'

import PhoneNumberCapabilitiesAlert from '../PhoneNumberCapabilitiesAlert'
import {
    getCountryCapabilityLimitationsMessage,
    getLimitationsMessageForType,
} from '../utils'

jest.mock('pages/phoneNumbers/utils')
const getLimitationsMessageForTypeMock = assumeMock(
    getLimitationsMessageForType,
)
const getCountryCapabilityLimitationsMessageMock = assumeMock(
    getCountryCapabilityLimitationsMessage,
)

describe('<PhoneNumberCapabilitiesAlert/>', () => {
    it('should not display anything if there are no limits', () => {
        jest.spyOn(
            capabilitiesHook,
            'usePhoneNumberCapabilities',
        ).mockReturnValue(null)

        const { container } = render(
            <PhoneNumberCapabilitiesAlert country={PhoneCountry.US} />,
        )

        expect(container.innerHTML).toBe('')
    })

    it('should display limitations message for a specific type', () => {
        getLimitationsMessageForTypeMock.mockReturnValue(
            'This is a limitations message',
        )
        const mockCapabilities = {
            [PhoneType.Local]: {
                sms: true,
                mms: true,
                voice: true,
                whatsapp: true,
            },
        }
        jest.spyOn(
            capabilitiesHook,
            'usePhoneNumberCapabilities',
        ).mockReturnValue(mockCapabilities)

        render(
            <PhoneNumberCapabilitiesAlert
                country={PhoneCountry.US}
                type={PhoneType.Local}
            />,
        )

        expect(getLimitationsMessageForTypeMock).toHaveBeenCalledWith(
            PhoneCountry.US,
            PhoneType.Local,
            mockCapabilities,
        )
        expect(
            screen.getByText('This is a limitations message'),
        ).toBeInTheDocument()
    })

    it('should display limitations message for all types when type is not provided', () => {
        getCountryCapabilityLimitationsMessageMock.mockReturnValue([
            'This is a limitations message for all types',
        ])
        const mockCapabilities = {
            [PhoneType.Local]: {
                sms: true,
                mms: true,
                voice: true,
                whatsapp: true,
            },
        }
        jest.spyOn(
            capabilitiesHook,
            'usePhoneNumberCapabilities',
        ).mockReturnValue(mockCapabilities)

        render(<PhoneNumberCapabilitiesAlert country={PhoneCountry.US} />)

        expect(getCountryCapabilityLimitationsMessageMock).toHaveBeenCalledWith(
            PhoneCountry.US,
            mockCapabilities,
        )
        expect(
            screen.getByText('This is a limitations message for all types'),
        ).toBeInTheDocument()
    })
})
