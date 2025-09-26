import React from 'react'

import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'

import VoiceCallTransferActivity from 'domains/reporting/pages/voice/components/VoiceCallTransferActivity/VoiceCallTransferActivity'
import { VoiceCallSummary } from 'domains/reporting/pages/voice/models/types'
import { VoiceCallSubjectType } from 'models/voiceCall/types'
import VoiceCallSubjectLabel from 'pages/common/components/VoiceCallSubjectLabel/VoiceCallSubjectLabel'

jest.mock('pages/common/components/VoiceCallSubjectLabel/VoiceCallSubjectLabel')

const VoiceCallSubjectLabelMock = assumeMock(VoiceCallSubjectLabel)

describe('VoiceCallTransferActivity', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render transfer to agent', () => {
        VoiceCallSubjectLabelMock.mockReturnValue(
            <div>Agent Transfer Label</div>,
        )

        const voiceCall = {
            transferType: 'agent',
            transferTargetAgentId: 123,
            transferTargetExternalNumber: null,
            transferTargetQueueId: null,
        } as VoiceCallSummary

        const { getByText } = render(
            <VoiceCallTransferActivity voiceCall={voiceCall} />,
        )

        expect(getByText('arrow_forward')).toBeInTheDocument()
        expect(getByText(/Transferred to/)).toBeInTheDocument()
        expect(getByText('Agent Transfer Label')).toBeInTheDocument()

        expect(VoiceCallSubjectLabelMock).toHaveBeenCalledWith(
            {
                subject: {
                    type: VoiceCallSubjectType.Agent,
                    id: 123,
                },
            },
            {},
        )
    })

    it('should render transfer to external number', () => {
        VoiceCallSubjectLabelMock.mockReturnValue(
            <div>External Transfer Label</div>,
        )

        const voiceCall = {
            transferType: 'external',
            transferTargetAgentId: null,
            transferTargetExternalNumber: '+1234567890',
            transferTargetQueueId: null,
        } as VoiceCallSummary

        const { getByText } = render(
            <VoiceCallTransferActivity voiceCall={voiceCall} />,
        )

        expect(getByText('arrow_forward')).toBeInTheDocument()
        expect(getByText(/Transferred to/)).toBeInTheDocument()
        expect(getByText('External Transfer Label')).toBeInTheDocument()

        expect(VoiceCallSubjectLabelMock).toHaveBeenCalledWith(
            {
                subject: {
                    type: VoiceCallSubjectType.External,
                    value: '+1234567890',
                },
            },
            {},
        )
    })

    it('should render transfer to queue', () => {
        VoiceCallSubjectLabelMock.mockReturnValue(
            <div>Queue Transfer Label</div>,
        )

        const voiceCall = {
            transferType: 'queue',
            transferTargetAgentId: null,
            transferTargetExternalNumber: null,
            transferTargetQueueId: 456,
        } as VoiceCallSummary

        const { getByText } = render(
            <VoiceCallTransferActivity voiceCall={voiceCall} />,
        )

        expect(getByText('arrow_forward')).toBeInTheDocument()
        expect(getByText(/Transferred to/)).toBeInTheDocument()
        expect(getByText('Queue Transfer Label')).toBeInTheDocument()

        expect(VoiceCallSubjectLabelMock).toHaveBeenCalledWith(
            {
                subject: {
                    type: VoiceCallSubjectType.Queue,
                    id: 456,
                },
            },
            {},
        )
    })

    it.each([
        {
            transferType: 'agent',
            transferTargetAgentId: null,
            transferTargetExternalNumber: null,
            transferTargetQueueId: null,
        },
        {
            transferType: 'external',
            transferTargetAgentId: null,
            transferTargetExternalNumber: null,
            transferTargetQueueId: null,
        },
        {
            transferType: 'queue',
            transferTargetAgentId: null,
            transferTargetExternalNumber: null,
            transferTargetQueueId: null,
        },
        {
            transferType: null,
            transferTargetAgentId: 123,
            transferTargetExternalNumber: '+1234567890',
            transferTargetQueueId: 456,
        },
    ])(
        'should render Unknown when transfer data is incomplete or malformed',
        (voiceCallData) => {
            const voiceCall = {
                ...voiceCallData,
            } as VoiceCallSummary

            const { container, getByText } = render(
                <VoiceCallTransferActivity voiceCall={voiceCall} />,
            )

            expect(getByText('arrow_forward')).toBeInTheDocument()
            expect(container.textContent).toContain('Transferred to')
            expect(container.textContent).toContain('Unknown')
            expect(VoiceCallSubjectLabelMock).not.toHaveBeenCalled()
        },
    )
})
