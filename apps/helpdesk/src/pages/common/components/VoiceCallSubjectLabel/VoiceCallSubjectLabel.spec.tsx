import { render, screen } from '@testing-library/react'

import { VoiceCallSubject, VoiceCallSubjectType } from 'models/voiceCall/types'
import * as voiceCallHooks from 'pages/tickets/detail/components/TicketVoiceCall/hooks'

import VoiceCallSubjectLabel from './VoiceCallSubjectLabel'

const useAgentDetailsSpy = jest.spyOn(voiceCallHooks, 'useAgentDetails')
const useCustomerDetailsSpy = jest.spyOn(voiceCallHooks, 'useCustomerDetails')

jest.mock('pages/phoneNumbers/utils', () => ({
    formatPhoneNumberInternational: jest.fn((phone: string) => phone),
}))

describe('VoiceCallSubjectLabel', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Agent type', () => {
        it('should render agent label for agent type subject', () => {
            useAgentDetailsSpy.mockReturnValue({
                data: { name: 'Guybrush Threepwood' },
            } as any)

            render(
                <VoiceCallSubjectLabel
                    subject={{
                        type: VoiceCallSubjectType.Agent,
                        id: 123,
                    }}
                />,
            )

            expect(screen.getByText('Guybrush Threepwood')).toBeInTheDocument()
            expect(useAgentDetailsSpy).toHaveBeenCalledWith(123)
        })
    })

    describe('External type', () => {
        it('should render customer label when external subject has customer', () => {
            useCustomerDetailsSpy.mockReturnValue({
                customer: { name: 'Elaine Marley' },
            } as any)

            const { container } = render(
                <VoiceCallSubjectLabel
                    subject={{
                        type: VoiceCallSubjectType.External,
                        value: '+1 5551234567',
                        customer: {
                            id: 789,
                            name: 'Elaine Marley',
                        },
                    }}
                />,
            )

            expect(container).toHaveTextContent('Elaine Marley (+1 5551234567)')
            expect(useCustomerDetailsSpy).toHaveBeenCalled()
        })

        it('should render customer label when external subject has customer with no name', () => {
            useCustomerDetailsSpy.mockReturnValue({
                customer: { name: 'Elaine Marley' },
            } as any)

            const { container } = render(
                <VoiceCallSubjectLabel
                    subject={{
                        type: VoiceCallSubjectType.External,
                        value: '+1 5551234567',
                        customer: {
                            id: 789,
                        },
                    }}
                />,
            )

            expect(container).toHaveTextContent('Elaine Marley (+1 5551234567)')
            expect(useCustomerDetailsSpy).toHaveBeenCalled()
        })

        it('should render phone number only when external subject has no customer', () => {
            render(
                <VoiceCallSubjectLabel
                    subject={{
                        type: VoiceCallSubjectType.External,
                        value: '+1 5551234567',
                    }}
                />,
            )

            expect(screen.getByText('+1 5551234567')).toBeInTheDocument()
            expect(useCustomerDetailsSpy).not.toHaveBeenCalled()
        })
    })

    describe('Unknown type', () => {
        it('should render Unknown for unrecognized subject type', () => {
            render(
                <VoiceCallSubjectLabel
                    subject={
                        {
                            type: 'invalid_type' as any,
                        } as VoiceCallSubject
                    }
                />,
            )

            expect(screen.getByText('Unknown')).toBeInTheDocument()
            expect(useAgentDetailsSpy).not.toHaveBeenCalled()
            expect(useCustomerDetailsSpy).not.toHaveBeenCalled()
        })
    })
})
