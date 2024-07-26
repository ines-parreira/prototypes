import React from 'react'
import {render} from '@testing-library/react'
import {VoiceCallStatus} from 'models/voiceCall/types'
import * as voiceCallHooks from 'pages/tickets/detail/components/TicketVoiceCall/hooks'
import {isFinalVoiceCallStatus} from 'models/voiceCall/utils'
import {assumeMock} from 'utils/testing'
import {VoiceCallSummary} from '../../models/types'
import VoiceCallActivity from './VoiceCallActivity'

jest.mock('models/voiceCall/utils')

const useCustomerDetailsSpy = jest.spyOn(voiceCallHooks, 'useCustomerDetails')
const useAgentDetailsSpy = jest.spyOn(voiceCallHooks, 'useAgentDetails')

const isFinalVoiceCallStatusMock = assumeMock(isFinalVoiceCallStatus)

describe('VoiceCallActivity', () => {
    it('should render completed inbound call activity', () => {
        useCustomerDetailsSpy.mockReturnValue({
            customer: 'Customer Name',
        } as any)
        useAgentDetailsSpy.mockReturnValue({
            data: {name: 'Agent Name'},
        } as any)
        isFinalVoiceCallStatusMock.mockReturnValue(true)

        const voiceCall = {
            agentId: 1,
            customerId: 2,
            phoneNumberSource: '123',
            phoneNumberDestination: '456',
            status: VoiceCallStatus.Completed,
            direction: 'inbound',
        } as VoiceCallSummary

        const {getByText} = render(<VoiceCallActivity voiceCall={voiceCall} />)

        const icon = getByText('call_received')
        expect(icon).toBeInTheDocument()
        expect(getByText('Customer Name')).toBeInTheDocument()
        expect(getByText('called')).toBeInTheDocument()
        expect(getByText('Agent Name')).toBeInTheDocument()
    })

    it('should render ringing inbound call activity', () => {
        useCustomerDetailsSpy.mockReturnValue({
            customer: 'Customer Name',
        } as any)
        useAgentDetailsSpy.mockReturnValue({
            data: {name: 'Agent Name'},
        } as any)
        isFinalVoiceCallStatusMock.mockReturnValue(false)

        const voiceCall = {
            agentId: null,
            customerId: 2,
            phoneNumberSource: '123',
            phoneNumberDestination: '456',
            status: VoiceCallStatus.Ringing,
            direction: 'inbound',
        } as VoiceCallSummary

        const {getByText} = render(<VoiceCallActivity voiceCall={voiceCall} />)

        const icon = getByText('call_received')
        expect(icon).toBeInTheDocument()
        expect(getByText('Customer Name')).toBeInTheDocument()
        expect(getByText('calling')).toBeInTheDocument()
        expect(useAgentDetailsSpy).not.toHaveBeenCalled()
    })

    it('should render missed inbound call activity', () => {
        useCustomerDetailsSpy.mockReturnValue({
            customer: 'Customer Name',
        } as any)
        useAgentDetailsSpy.mockReturnValue({
            data: {name: 'Agent Name'},
        } as any)
        isFinalVoiceCallStatusMock.mockReturnValue(true)

        const voiceCall = {
            agentId: null,
            customerId: 2,
            phoneNumberSource: '123',
            phoneNumberDestination: '456',
            status: VoiceCallStatus.Missed,
            direction: 'inbound',
        } as VoiceCallSummary

        const {getByText} = render(<VoiceCallActivity voiceCall={voiceCall} />)

        const icon = getByText('call_received')
        expect(icon).toBeInTheDocument()
        expect(getByText('Customer Name')).toBeInTheDocument()
        expect(getByText('called')).toBeInTheDocument()
        expect(useAgentDetailsSpy).not.toHaveBeenCalled()
    })

    it.each([
        {
            agentHookData: undefined,
            phoneNumberDestination: '+123456789',
            expectedLabel: '+123456789',
        },
        {
            agentHookData: undefined,
            phoneNumberDestination: null,
            expectedLabel: 'Unknown agent',
        },
    ])(
        'should render inbound call activity with agent data missing',
        ({agentHookData, phoneNumberDestination, expectedLabel}) => {
            useCustomerDetailsSpy.mockReturnValue({
                customer: 'Customer Name',
            } as any)
            useAgentDetailsSpy.mockReturnValue({
                data: {name: agentHookData},
            } as any)
            isFinalVoiceCallStatusMock.mockReturnValue(true)

            const voiceCall = {
                agentId: 1,
                customerId: 2,
                phoneNumberSource: '123',
                phoneNumberDestination: phoneNumberDestination,
                status: VoiceCallStatus.Missed,
                direction: 'inbound',
            } as VoiceCallSummary

            const {getByText} = render(
                <VoiceCallActivity voiceCall={voiceCall} />
            )

            const icon = getByText('call_received')
            expect(icon).toBeInTheDocument()
            expect(getByText('Customer Name')).toBeInTheDocument()
            expect(getByText('called')).toBeInTheDocument()
            expect(getByText(expectedLabel)).toBeInTheDocument()
        }
    )

    it.each([
        {
            customerId: '2',
            customerHookData: undefined,
            phoneNumberSource: '+123456789',
            expectedLabel: '+123456789',
        },
        {
            customerId: null,
            customerHookData: 'test',
            phoneNumberSource: 'phone number source',
            expectedLabel: 'phone number source',
        },
        {
            customerId: null,
            customerHookData: 'test',
            phoneNumberSource: null,
            expectedLabel: 'Unknown customer',
        },
    ])(
        'should render inbound call activity with customer data missing',
        ({customerHookData, customerId, phoneNumberSource, expectedLabel}) => {
            useCustomerDetailsSpy.mockReturnValue({
                customer: customerHookData,
            } as any)
            useAgentDetailsSpy.mockReturnValue({
                data: {name: 'Agent Name'},
            } as any)

            const voiceCall = {
                agentId: null,
                customerId: customerId,
                phoneNumberDestination: '+123456789',
                phoneNumberSource: phoneNumberSource,
                status: VoiceCallStatus.Missed,
                direction: 'inbound',
            } as VoiceCallSummary

            const {getByText} = render(
                <VoiceCallActivity voiceCall={voiceCall} />
            )

            const icon = getByText('call_received')
            expect(icon).toBeInTheDocument()
            expect(getByText(expectedLabel)).toBeInTheDocument()
        }
    )

    it('should render outbound call activity', () => {
        useCustomerDetailsSpy.mockReturnValue({
            customer: 'Customer Name',
        } as any)
        useAgentDetailsSpy.mockReturnValue({
            data: {name: 'Agent Name'},
        } as any)

        const voiceCall = {
            agentId: 1,
            customerId: 2,
            phoneNumberSource: '123',
            phoneNumberDestination: '456',
            status: VoiceCallStatus.Completed,
            direction: 'outbound',
        } as VoiceCallSummary

        const {getByText} = render(<VoiceCallActivity voiceCall={voiceCall} />)

        const icon = getByText('call_made')
        expect(icon).toBeInTheDocument()
        expect(getByText('Customer Name')).toBeInTheDocument()
        expect(getByText('called')).toBeInTheDocument()
        expect(getByText('Agent Name')).toBeInTheDocument()
    })

    it('should render outbound ringing call activity', () => {
        useCustomerDetailsSpy.mockReturnValue({
            customer: 'Customer Name',
        } as any)
        useAgentDetailsSpy.mockReturnValue({
            data: {name: 'Agent Name'},
        } as any)
        isFinalVoiceCallStatusMock.mockReturnValue(false)

        const voiceCall = {
            agentId: 1,
            customerId: 2,
            phoneNumberSource: '123',
            phoneNumberDestination: '456',
            status: VoiceCallStatus.Ringing,
            direction: 'outbound',
        } as VoiceCallSummary

        const {getByText} = render(<VoiceCallActivity voiceCall={voiceCall} />)

        const icon = getByText('call_made')
        expect(icon).toBeInTheDocument()
        expect(getByText('Customer Name')).toBeInTheDocument()
        expect(getByText('calling')).toBeInTheDocument()
        expect(getByText('Agent Name')).toBeInTheDocument()
    })

    it.each([
        {
            agentId: '2',
            agentHookData: undefined,
            phoneNumberSource: '+123456789',
            expectedLabel: '+123456789',
        },
        {
            agentId: null,
            agentHookData: 'test',
            phoneNumberSource: 'phone number source',
            expectedLabel: 'phone number source',
        },
        {
            agentId: null,
            agentHookData: 'test',
            phoneNumberSource: null,
            expectedLabel: 'Unknown agent',
        },
    ])(
        `should render outbound call activity with agent data missing`,
        ({agentHookData, agentId, phoneNumberSource, expectedLabel}) => {
            useCustomerDetailsSpy.mockReturnValue({
                customer: 'Customer Name',
            } as any)
            useAgentDetailsSpy.mockReturnValue({
                data: {name: agentHookData},
            } as any)
            isFinalVoiceCallStatusMock.mockReturnValue(true)

            const voiceCall = {
                agentId: agentId,
                customerId: 2,
                phoneNumberSource: phoneNumberSource,
                phoneNumberDestination: '456',
                status: VoiceCallStatus.Completed,
                direction: 'outbound',
            } as VoiceCallSummary

            const {getByText} = render(
                <VoiceCallActivity voiceCall={voiceCall} />
            )

            expect(getByText(expectedLabel)).toBeInTheDocument()
        }
    )

    it.each([
        {
            customerId: '2',
            customerHookData: undefined,
            phoneNumberDestination: '+123456789',
            expectedLabel: '+123456789',
        },
        {
            customerId: null,
            customerHookData: 'test',
            phoneNumberDestination: 'phone number destination',
            expectedLabel: 'phone number destination',
        },
        {
            customerId: null,
            customerHookData: 'test',
            phoneNumberDestination: null,
            expectedLabel: 'Unknown customer',
        },
    ])(
        `should render outbound call activity with customer data missing`,
        ({
            customerHookData,
            customerId,
            phoneNumberDestination,
            expectedLabel,
        }) => {
            useCustomerDetailsSpy.mockReturnValue({
                customer: customerHookData,
            } as any)
            useAgentDetailsSpy.mockReturnValue({
                data: {name: 'Agent Name'},
            } as any)

            const voiceCall = {
                agentId: 1,
                customerId: customerId,
                phoneNumberSource: '123',
                phoneNumberDestination: phoneNumberDestination,
                status: VoiceCallStatus.Completed,
                direction: 'outbound',
            } as VoiceCallSummary

            const {getByText} = render(
                <VoiceCallActivity voiceCall={voiceCall} />
            )

            expect(getByText(expectedLabel)).toBeInTheDocument()
        }
    )
})
