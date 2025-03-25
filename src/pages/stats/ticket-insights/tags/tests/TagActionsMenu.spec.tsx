import React from 'react'

import { fireEvent, render, screen, within } from '@testing-library/react'

import { logEvent, SegmentEvent } from 'common/segment'
import {
    TagSelection,
    useTagResultsSelection,
} from 'hooks/useTagResultsSelection'
import {
    EXCLUDE_TAGS_IN_RESULTS,
    EXCLUDE_TAGS_IN_RESULTS_SUBTITLE,
    INCLUDE_TAGS_IN_RESULTS,
    INCLUDE_TAGS_IN_RESULTS_SUBTITLE,
    TAG_ACTIONS_DOWNLOAD_OPTION_LABEL,
    TAG_ACTIONS_TRIGGER_LABEL,
    TagActionsMenu,
} from 'pages/stats/ticket-insights/tags/TagActionsMenu'
import { useDownloadTagsReportData } from 'services/reporting/tagsReportingService'
import { assumeMock } from 'utils/testing'

jest.mock('services/reporting/tagsReportingService')
const useDownloadTagsReportDataMock = assumeMock(useDownloadTagsReportData)
jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)
jest.mock('hooks/useTagResultsSelection')
const useTagResultsSelectionMock = assumeMock(useTagResultsSelection)

describe('TagActionsMenu', () => {
    const downloadMock = jest.fn()
    const setTagResultsSelection = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        useDownloadTagsReportDataMock.mockReturnValue({
            download: downloadMock,
            isLoading: false,
        })
        useTagResultsSelectionMock.mockReturnValue([
            TagSelection.includeTags,
            setTagResultsSelection,
        ])
    })

    it('renders the actions button', () => {
        render(<TagActionsMenu />)

        expect(
            screen.getByLabelText(TAG_ACTIONS_TRIGGER_LABEL),
        ).toBeInTheDocument()
    })

    it('opens dropdown when clicking the button', () => {
        render(<TagActionsMenu />)

        fireEvent.click(screen.getByLabelText(TAG_ACTIONS_TRIGGER_LABEL))

        expect(screen.getByText(INCLUDE_TAGS_IN_RESULTS)).toBeInTheDocument()
        expect(
            screen.getByText(INCLUDE_TAGS_IN_RESULTS_SUBTITLE),
        ).toBeInTheDocument()
        expect(screen.getByText(EXCLUDE_TAGS_IN_RESULTS)).toBeInTheDocument()
        expect(
            screen.getByText(EXCLUDE_TAGS_IN_RESULTS_SUBTITLE),
        ).toBeInTheDocument()
        expect(
            screen.getByText(TAG_ACTIONS_DOWNLOAD_OPTION_LABEL),
        ).toBeInTheDocument()
    })

    it('triggers download when clicking the download option', () => {
        render(<TagActionsMenu />)

        fireEvent.click(screen.getByLabelText(TAG_ACTIONS_TRIGGER_LABEL))
        fireEvent.click(screen.getByText(TAG_ACTIONS_DOWNLOAD_OPTION_LABEL))

        expect(downloadMock).toHaveBeenCalledTimes(1)
    })

    it('disables download option when loading', () => {
        useDownloadTagsReportDataMock.mockReturnValue({
            download: downloadMock,
            isLoading: true,
        })

        render(<TagActionsMenu />)

        fireEvent.click(screen.getByLabelText(TAG_ACTIONS_TRIGGER_LABEL))
        const downloadOption = screen.getByText(
            TAG_ACTIONS_DOWNLOAD_OPTION_LABEL,
        )

        fireEvent.click(downloadOption)
        expect(downloadMock).not.toHaveBeenCalled()
    })

    it('should have include tag option by default and select it', () => {
        render(<TagActionsMenu />)

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
        render(<TagActionsMenu />)

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
})
