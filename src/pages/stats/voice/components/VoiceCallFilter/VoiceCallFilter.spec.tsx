import React from 'react'

import { fireEvent, render } from '@testing-library/react'

import { VoiceCallDisplayStatus } from 'models/voiceCall/types'
import { VoiceCallFilterDirection } from 'pages/stats/voice/models/types'

import VoiceCallFilter from './VoiceCallFilter'

describe('VoiceCallDirectionFilter', () => {
    it('should render all filter', () => {
        const mockFilterSelect = jest.fn()
        const { getByText } = render(
            <VoiceCallFilter onFilterSelect={mockFilterSelect} />,
        )
        expect(getByText('All')).toBeInTheDocument()
        expect(getByText('Inbound')).toBeInTheDocument()
        expect(getByText('Outbound')).toBeInTheDocument()

        // check that if changing filter and setting back to all it uses the correct filter
        fireEvent.click(getByText('Inbound'))
        fireEvent.click(getByText('All'))

        expect(mockFilterSelect).toHaveBeenLastCalledWith({
            direction: VoiceCallFilterDirection.All,
        })
        expect(getByText('Select filter')).toBeInTheDocument()
    })

    describe('Inbound filter', () => {
        it('should allow selecting the filter', () => {
            const mockFilterSelect = jest.fn()
            const { getByText } = render(
                <VoiceCallFilter onFilterSelect={mockFilterSelect} />,
            )
            const inboundFilter = getByText('Inbound')
            expect(inboundFilter).toBeInTheDocument()

            fireEvent.click(inboundFilter)

            expect(mockFilterSelect).toHaveBeenCalledWith({
                direction: VoiceCallFilterDirection.Inbound,
                statuses: [
                    VoiceCallDisplayStatus.Answered,
                    VoiceCallDisplayStatus.Missed,
                    VoiceCallDisplayStatus.Cancelled,
                    VoiceCallDisplayStatus.Abandoned,
                ],
            })
            expect(
                getByText('Answered, Missed, Cancelled, Abandoned'),
            ).toBeInTheDocument()
        })

        it('should allow selecting specific statuses', () => {
            const mockFilterSelect = jest.fn()
            const { getByText } = render(
                <VoiceCallFilter onFilterSelect={mockFilterSelect} />,
            )

            fireEvent.click(getByText('Inbound'))

            const dropdownLabel = getByText(
                'Answered, Missed, Cancelled, Abandoned',
            )
            fireEvent.click(dropdownLabel)

            fireEvent.click(getByText('Answered'))
            fireEvent.click(getByText('Abandoned'))

            fireEvent.click(dropdownLabel)

            expect(mockFilterSelect).toHaveBeenLastCalledWith({
                direction: VoiceCallFilterDirection.Inbound,
                statuses: [
                    VoiceCallDisplayStatus.Missed,
                    VoiceCallDisplayStatus.Cancelled,
                ],
            })
            expect(getByText('Missed, Cancelled')).toBeInTheDocument()

            fireEvent.click(dropdownLabel)

            fireEvent.click(getByText('Answered'))

            fireEvent.click(dropdownLabel)

            expect(mockFilterSelect).toHaveBeenLastCalledWith({
                direction: VoiceCallFilterDirection.Inbound,
                statuses: [
                    VoiceCallDisplayStatus.Answered,
                    VoiceCallDisplayStatus.Missed,
                    VoiceCallDisplayStatus.Cancelled,
                ],
            })
            expect(getByText('Answered, Missed, Cancelled')).toBeInTheDocument()
        })

        it('should allow deselecting and selecting all statuses', () => {
            const mockFilterSelect = jest.fn()
            const { getByText } = render(
                <VoiceCallFilter onFilterSelect={mockFilterSelect} />,
            )

            fireEvent.click(getByText('Inbound'))

            const dropdownLabel = getByText(
                'Answered, Missed, Cancelled, Abandoned',
            )
            fireEvent.click(dropdownLabel)

            const deselectAll = getByText('Deselect all')
            expect(deselectAll).toBeInTheDocument()
            fireEvent.click(deselectAll)

            fireEvent.click(dropdownLabel)

            expect(mockFilterSelect).toHaveBeenLastCalledWith({
                direction: VoiceCallFilterDirection.Inbound,
                statuses: [],
            })
            expect(getByText('Select filter')).toBeInTheDocument()

            fireEvent.click(dropdownLabel)

            const selectAll = getByText('Select all')
            expect(selectAll).toBeInTheDocument()
            fireEvent.click(selectAll)

            fireEvent.click(dropdownLabel)

            expect(mockFilterSelect).toHaveBeenLastCalledWith({
                direction: VoiceCallFilterDirection.Inbound,
                statuses: [
                    VoiceCallDisplayStatus.Answered,
                    VoiceCallDisplayStatus.Missed,
                    VoiceCallDisplayStatus.Cancelled,
                    VoiceCallDisplayStatus.Abandoned,
                ],
            })
            expect(
                getByText('Answered, Missed, Cancelled, Abandoned'),
            ).toBeInTheDocument()
        })
    })

    it('should allow changing to outbound filter', () => {
        const mockFilterSelect = jest.fn()
        const { getByText } = render(
            <VoiceCallFilter onFilterSelect={mockFilterSelect} />,
        )
        expect(getByText('Outbound')).toBeInTheDocument()

        fireEvent.click(getByText('Outbound'))

        expect(mockFilterSelect).toHaveBeenCalledWith({
            direction: VoiceCallFilterDirection.Outbound,
            statuses: [
                VoiceCallDisplayStatus.Answered,
                VoiceCallDisplayStatus.Unanswered,
                VoiceCallDisplayStatus.Failed,
            ],
        })
        expect(getByText('Answered, Unanswered, Failed')).toBeInTheDocument()
    })

    describe('Outbound filter', () => {
        it('should allow selecting the filter', () => {
            const mockFilterSelect = jest.fn()
            const { getByText } = render(
                <VoiceCallFilter onFilterSelect={mockFilterSelect} />,
            )
            const inboundFilter = getByText('Outbound')
            expect(inboundFilter).toBeInTheDocument()

            fireEvent.click(inboundFilter)

            expect(mockFilterSelect).toHaveBeenCalledWith({
                direction: VoiceCallFilterDirection.Outbound,
                statuses: [
                    VoiceCallDisplayStatus.Answered,
                    VoiceCallDisplayStatus.Unanswered,
                    VoiceCallDisplayStatus.Failed,
                ],
            })
            expect(
                getByText('Answered, Unanswered, Failed'),
            ).toBeInTheDocument()
        })

        it('should allow selecting specific statuses', () => {
            const mockFilterSelect = jest.fn()
            const { getByText } = render(
                <VoiceCallFilter onFilterSelect={mockFilterSelect} />,
            )

            fireEvent.click(getByText('Outbound'))

            const dropdownLabel = getByText('Answered, Unanswered, Failed')
            fireEvent.click(dropdownLabel)

            fireEvent.click(getByText('Answered'))
            fireEvent.click(getByText('Failed'))

            fireEvent.click(dropdownLabel)

            expect(mockFilterSelect).toHaveBeenLastCalledWith({
                direction: VoiceCallFilterDirection.Outbound,
                statuses: [VoiceCallDisplayStatus.Unanswered],
            })
            expect(getByText('Unanswered')).toBeInTheDocument()

            fireEvent.click(dropdownLabel)

            fireEvent.click(getByText('Answered'))

            fireEvent.click(dropdownLabel)

            expect(mockFilterSelect).toHaveBeenLastCalledWith({
                direction: VoiceCallFilterDirection.Outbound,
                statuses: [
                    VoiceCallDisplayStatus.Answered,
                    VoiceCallDisplayStatus.Unanswered,
                ],
            })
            expect(getByText('Answered, Unanswered')).toBeInTheDocument()
        })

        it('should allow deselecting and selecting all statuses', () => {
            const mockFilterSelect = jest.fn()
            const { getByText } = render(
                <VoiceCallFilter onFilterSelect={mockFilterSelect} />,
            )

            fireEvent.click(getByText('Outbound'))

            const dropdownLabel = getByText('Answered, Unanswered, Failed')
            fireEvent.click(dropdownLabel)

            const deselectAll = getByText('Deselect all')
            expect(deselectAll).toBeInTheDocument()
            fireEvent.click(deselectAll)

            fireEvent.click(dropdownLabel)

            expect(mockFilterSelect).toHaveBeenLastCalledWith({
                direction: VoiceCallFilterDirection.Outbound,
                statuses: [],
            })
            expect(getByText('Select filter')).toBeInTheDocument()

            fireEvent.click(dropdownLabel)

            const selectAll = getByText('Select all')
            expect(selectAll).toBeInTheDocument()
            fireEvent.click(selectAll)

            fireEvent.click(dropdownLabel)

            expect(mockFilterSelect).toHaveBeenLastCalledWith({
                direction: VoiceCallFilterDirection.Outbound,
                statuses: [
                    VoiceCallDisplayStatus.Answered,
                    VoiceCallDisplayStatus.Unanswered,
                    VoiceCallDisplayStatus.Failed,
                ],
            })
            expect(
                getByText('Answered, Unanswered, Failed'),
            ).toBeInTheDocument()
        })
    })
})
