import React from 'react'

import { assumeMock } from '@repo/testing'
import { fireEvent, render, screen } from '@testing-library/react'

import { SegmentEvent } from 'common/segment'
import { logEventWithSampling } from 'common/segment/segment'
import {
    ReportIssueLabels,
    ReportIssueOption,
} from 'models/aiAgentFeedback/constants'

import FeedbackReportIssue from '../FeedbackReportIssue'

jest.mock('common/segment/segment')
const logEventMock = assumeMock(logEventWithSampling)

describe('FeedbackReportIssue', () => {
    const getFirstEnumValue = (): ReportIssueOption => {
        const enumValues = Object.values(ReportIssueOption) as string[]
        return enumValues[0] as ReportIssueOption
    }

    it('displays tags for each value', () => {
        const allOptions = Object.values(ReportIssueOption)

        render(
            <FeedbackReportIssue
                value={allOptions}
                onChange={jest.fn()}
                accountId={1}
            />,
        )

        let count = 0
        Object.values(ReportIssueLabels).forEach((label) => {
            expect(screen.getByText(label)).toBeInTheDocument()
            count += 1
        })
        expect(count).toEqual(allOptions.length)
    })

    it('should remove tag when clicked', () => {
        const allOptions = Object.values(ReportIssueOption)

        const onChange = jest.fn()

        render(
            <FeedbackReportIssue
                value={allOptions}
                onChange={onChange}
                accountId={1}
            />,
        )

        fireEvent.click(screen.getAllByText('close')[0])

        expect(onChange).toHaveBeenCalledWith(allOptions.slice(1))
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.AiAgentFeedbackReportIssueSelectRemoveOption,
            {
                accountId: 1,
                value: allOptions[0],
            },
        )
    })

    it('should add option when clicked', () => {
        const onChange = jest.fn()

        render(
            <FeedbackReportIssue
                value={[]}
                onChange={onChange}
                accountId={1}
            />,
        )

        const listBox = screen.getByRole('combobox')
        fireEvent.focus(listBox)

        const dropdownItem = screen.getAllByRole('option')
        fireEvent.click(dropdownItem[0])

        const firstElement = getFirstEnumValue()
        expect(onChange).toHaveBeenCalledWith([firstElement])
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.AiAgentFeedbackReportIssueSelectAddOption,
            {
                accountId: 1,
                value: firstElement,
            },
        )
    })

    it('should remove option when clicked', () => {
        const onChange = jest.fn()

        const firstElement = getFirstEnumValue()
        render(
            <FeedbackReportIssue
                value={[firstElement]}
                onChange={onChange}
                accountId={1}
            />,
        )

        const listBox = screen.getByRole('combobox')
        fireEvent.focus(listBox)

        const dropdownItem = screen.getAllByRole('option')
        fireEvent.click(dropdownItem[0])

        expect(onChange).toHaveBeenCalledWith([])
    })
})
