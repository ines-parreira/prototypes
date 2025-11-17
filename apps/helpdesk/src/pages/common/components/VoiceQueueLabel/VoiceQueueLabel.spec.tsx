import { render } from '@testing-library/react'

import type { VoiceQueue } from '@gorgias/helpdesk-queries'

import { VoiceQueueContext } from 'domains/reporting/pages/voice/components/VoiceQueue/VoiceQueueContext'

import VoiceQueueLabel, { LOADING_TEST_ID } from './VoiceQueueLabel'

describe('VoiceQueueLabel', () => {
    const renderWithContext = (
        queue: VoiceQueue | null | undefined,
        queueId: number,
        queueName?: string | null,
    ) => {
        return render(
            <VoiceQueueContext.Provider
                value={{
                    getQueueFromId: () => queue,
                }}
            >
                <VoiceQueueLabel queueId={queueId} queueName={queueName} />
            </VoiceQueueContext.Provider>,
        )
    }

    it('should show skeleton when queue is still loading', () => {
        const { getByTestId } = renderWithContext(undefined, 1)
        expect(getByTestId(LOADING_TEST_ID))
    })

    it('should show fallback queue name when queue is not available', () => {
        const { getByText } = renderWithContext(null, 1, 'Fallback Queue Name')
        expect(getByText('Fallback Queue Name'))
    })

    it('should show queue name when queue is available', () => {
        const { getByText } = renderWithContext(
            {
                id: 1,
                name: 'Test Queue',
            } as VoiceQueue,
            1,
        )
        expect(getByText('Test Queue'))
    })
})
