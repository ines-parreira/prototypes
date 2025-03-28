import React from 'react'

import { fireEvent, render, screen, within } from '@testing-library/react'

import { logEvent, SegmentEvent } from 'common/segment'
import {
    TagSelection,
    useTagResultsSelection,
} from 'hooks/reporting/tags/useTagResultsSelection'
import {
    TimeframePreferenceSelection,
    useTimeframePreferenceSelection,
} from 'hooks/reporting/ticket-insights/useTimeframePreferenceSelection'
import {
    EXCLUDE_TAGS_IN_RESULTS,
    EXCLUDE_TAGS_IN_RESULTS_SUBTITLE,
    INCLUDE_TAGS_IN_RESULTS,
    INCLUDE_TAGS_IN_RESULTS_SUBTITLE,
    ReportName,
    RESULTS_BASED_ON_ALL_STATUSES,
    RESULTS_BASED_ON_ALL_STATUSES_SUBTITLE,
    RESULTS_BASED_ON_CREATION_DATE,
    RESULTS_BASED_ON_CREATION_DATE_SUBTITLE,
    SharedActionsMenu,
    TAG_ACTIONS_DOWNLOAD_OPTION_LABEL,
    TAG_ACTIONS_TRIGGER_LABEL,
} from 'pages/stats/common/components/SharedActionsMenu/SharedActionsMenu'
import { assumeMock } from 'utils/testing'

jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)
jest.mock('hooks/reporting/tags/useTagResultsSelection')
const useTagResultsSelectionMock = assumeMock(useTagResultsSelection)
jest.mock('hooks/reporting/ticket-insights/useTimeframePreferenceSelection')
const useTimeframePreferenceSelectionMock = assumeMock(
    useTimeframePreferenceSelection,
)

describe('SharedActionsMenu', () => {
    const downloadMock = jest.fn()
    const setTagResultsSelection = jest.fn()
    const setTimeframePreferenceSelection = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()

        useTagResultsSelectionMock.mockReturnValue([
            TagSelection.includeTags,
            setTagResultsSelection,
        ])

        useTimeframePreferenceSelectionMock.mockReturnValue([
            TimeframePreferenceSelection.basedOnTicketStatuses,
            setTimeframePreferenceSelection,
        ])
    })

    describe('  reportName={ReportName.Tags}', () => {
        it('renders the actions button', () => {
            render(
                <SharedActionsMenu
                    reportName={ReportName.Tags}
                    downloadAction={downloadMock}
                    isDownloadLoading={false}
                />,
            )

            expect(
                screen.getByLabelText(TAG_ACTIONS_TRIGGER_LABEL),
            ).toBeInTheDocument()
        })

        it('opens dropdown when clicking the button', () => {
            render(
                <SharedActionsMenu
                    reportName={ReportName.Tags}
                    downloadAction={downloadMock}
                    isDownloadLoading={false}
                />,
            )

            fireEvent.click(screen.getByLabelText(TAG_ACTIONS_TRIGGER_LABEL))

            expect(
                screen.getByText(INCLUDE_TAGS_IN_RESULTS),
            ).toBeInTheDocument()
            expect(
                screen.getByText(INCLUDE_TAGS_IN_RESULTS_SUBTITLE),
            ).toBeInTheDocument()
            expect(
                screen.getByText(EXCLUDE_TAGS_IN_RESULTS),
            ).toBeInTheDocument()
            expect(
                screen.getByText(EXCLUDE_TAGS_IN_RESULTS_SUBTITLE),
            ).toBeInTheDocument()
            expect(
                screen.getByText(TAG_ACTIONS_DOWNLOAD_OPTION_LABEL),
            ).toBeInTheDocument()

            expect(
                screen.getByText(RESULTS_BASED_ON_ALL_STATUSES),
            ).toBeInTheDocument()
            expect(
                screen.getByText(RESULTS_BASED_ON_ALL_STATUSES_SUBTITLE),
            ).toBeInTheDocument()
            expect(
                screen.getByText(RESULTS_BASED_ON_CREATION_DATE),
            ).toBeInTheDocument()
            expect(
                screen.getByText(RESULTS_BASED_ON_CREATION_DATE_SUBTITLE),
            ).toBeInTheDocument()
        })

        it('triggers download when clicking the download option', () => {
            render(
                <SharedActionsMenu
                    reportName={ReportName.Tags}
                    downloadAction={downloadMock}
                    isDownloadLoading={false}
                />,
            )

            fireEvent.click(screen.getByLabelText(TAG_ACTIONS_TRIGGER_LABEL))
            fireEvent.click(screen.getByText(TAG_ACTIONS_DOWNLOAD_OPTION_LABEL))

            expect(downloadMock).toHaveBeenCalledTimes(1)
        })

        it('disables download option when loading', () => {
            render(
                <SharedActionsMenu
                    reportName={ReportName.Tags}
                    downloadAction={downloadMock}
                    isDownloadLoading
                />,
            )

            fireEvent.click(screen.getByLabelText(TAG_ACTIONS_TRIGGER_LABEL))
            const downloadOption = screen.getByText(
                TAG_ACTIONS_DOWNLOAD_OPTION_LABEL,
            )

            fireEvent.click(downloadOption)
            expect(downloadMock).not.toHaveBeenCalled()
        })

        it('should have include tag option by default and select it', () => {
            render(
                <SharedActionsMenu
                    reportName={ReportName.Tags}
                    downloadAction={downloadMock}
                    isDownloadLoading={false}
                />,
            )

            fireEvent.click(screen.getByLabelText(TAG_ACTIONS_TRIGGER_LABEL))

            const spanElement = screen.getByText(INCLUDE_TAGS_IN_RESULTS)
            const parentDiv = spanElement.parentElement as HTMLElement
            within(parentDiv).getByText('check')

            fireEvent.click(screen.getByText(INCLUDE_TAGS_IN_RESULTS))

            fireEvent.click(screen.getByLabelText(TAG_ACTIONS_TRIGGER_LABEL))

            within(parentDiv).getByText('check')

            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.StatTagsIncludeRelatedClicked,
            )
        })

        it('should select exclude_tags', () => {
            render(
                <SharedActionsMenu
                    reportName={ReportName.Tags}
                    downloadAction={downloadMock}
                    isDownloadLoading={false}
                />,
            )

            fireEvent.click(screen.getByLabelText(TAG_ACTIONS_TRIGGER_LABEL))

            fireEvent.click(screen.getByText(EXCLUDE_TAGS_IN_RESULTS))

            fireEvent.click(screen.getByLabelText(TAG_ACTIONS_TRIGGER_LABEL))

            expect(setTagResultsSelection).toHaveBeenCalledWith(
                TagSelection.excludeTags,
            )

            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.StatTagsExcludeRelatedClicked,
            )
        })

        it('should have the correct label selected & select another option', () => {
            render(
                <SharedActionsMenu
                    reportName={ReportName.Tags}
                    downloadAction={downloadMock}
                    isDownloadLoading={false}
                />,
            )

            fireEvent.click(screen.getByLabelText(TAG_ACTIONS_TRIGGER_LABEL))

            const spanElement = screen.getByText(RESULTS_BASED_ON_ALL_STATUSES)
            const parentDiv = spanElement.parentElement as HTMLElement
            within(parentDiv).getByText('check')

            fireEvent.click(screen.getByText(RESULTS_BASED_ON_ALL_STATUSES))

            expect(setTimeframePreferenceSelection).toHaveBeenCalledWith(
                TimeframePreferenceSelection.basedOnTicketStatuses,
            )

            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.StatTimeframePreferenceSelection,
                {
                    value: TimeframePreferenceSelection.basedOnTicketStatuses,
                    report: 'tags',
                },
            )

            fireEvent.click(screen.getByLabelText(TAG_ACTIONS_TRIGGER_LABEL))
            fireEvent.click(screen.getByText(RESULTS_BASED_ON_CREATION_DATE))

            expect(setTimeframePreferenceSelection).toHaveBeenCalledWith(
                TimeframePreferenceSelection.basedOnTicketCreationDate,
            )

            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.StatTimeframePreferenceSelection,
                {
                    value: TimeframePreferenceSelection.basedOnTicketCreationDate,
                    report: 'tags',
                },
            )
        })
    })

    describe('isTicketFieldsReport', () => {
        it('renders the actions button', () => {
            render(
                <SharedActionsMenu
                    reportName={ReportName.Tags}
                    downloadAction={downloadMock}
                    isDownloadLoading={false}
                />,
            )

            expect(
                screen.getByLabelText(TAG_ACTIONS_TRIGGER_LABEL),
            ).toBeInTheDocument()
        })

        it('opens dropdown when clicking the button', () => {
            render(
                <SharedActionsMenu
                    reportName={ReportName.TicketFields}
                    downloadAction={downloadMock}
                    isDownloadLoading={false}
                />,
            )

            fireEvent.click(screen.getByLabelText(TAG_ACTIONS_TRIGGER_LABEL))

            expect(
                screen.getByText(RESULTS_BASED_ON_ALL_STATUSES),
            ).toBeInTheDocument()
            expect(
                screen.getByText(RESULTS_BASED_ON_ALL_STATUSES_SUBTITLE),
            ).toBeInTheDocument()
            expect(
                screen.getByText(RESULTS_BASED_ON_CREATION_DATE),
            ).toBeInTheDocument()
            expect(
                screen.getByText(RESULTS_BASED_ON_CREATION_DATE_SUBTITLE),
            ).toBeInTheDocument()
        })

        it('should have the correct label selected & select another option', () => {
            render(
                <SharedActionsMenu
                    reportName={ReportName.TicketFields}
                    downloadAction={downloadMock}
                    isDownloadLoading={false}
                />,
            )

            fireEvent.click(screen.getByLabelText(TAG_ACTIONS_TRIGGER_LABEL))

            const spanElement = screen.getByText(RESULTS_BASED_ON_ALL_STATUSES)
            const parentDiv = spanElement.parentElement as HTMLElement
            within(parentDiv).getByText('check')

            fireEvent.click(screen.getByText(RESULTS_BASED_ON_ALL_STATUSES))

            expect(setTimeframePreferenceSelection).toHaveBeenCalledWith(
                TimeframePreferenceSelection.basedOnTicketStatuses,
            )

            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.StatTimeframePreferenceSelection,
                {
                    value: TimeframePreferenceSelection.basedOnTicketStatuses,
                    report: 'ticket-fields',
                },
            )

            fireEvent.click(screen.getByLabelText(TAG_ACTIONS_TRIGGER_LABEL))
            fireEvent.click(screen.getByText(RESULTS_BASED_ON_CREATION_DATE))

            expect(setTimeframePreferenceSelection).toHaveBeenCalledWith(
                TimeframePreferenceSelection.basedOnTicketCreationDate,
            )

            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.StatTimeframePreferenceSelection,
                {
                    value: TimeframePreferenceSelection.basedOnTicketCreationDate,
                    report: 'ticket-fields',
                },
            )
        })
    })
})
