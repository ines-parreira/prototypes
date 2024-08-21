import React from 'react'
import {fireEvent, render} from '@testing-library/react'

import {
    ReportIssueLabels,
    ReportIssueOption,
} from 'models/aiAgentFeedback/constants'

import FeedbackReportIssue from '../FeedbackReportIssue'

describe('FeedbackReportIssue', () => {
    const getFirstEnumValue = (): ReportIssueOption => {
        const enumValues = Object.values(ReportIssueOption) as string[]
        return enumValues[0] as ReportIssueOption
    }

    it('displays tags for each value', () => {
        const allOptions = Object.values(ReportIssueOption)

        const {getAllByTestId} = render(
            <FeedbackReportIssue value={allOptions} onChange={jest.fn()} />
        )

        const tags = getAllByTestId('tag')
        expect(tags).toHaveLength(allOptions.length)

        tags.forEach((tag, index) => {
            expect(tag).toHaveTextContent(ReportIssueLabels[allOptions[index]])
        })
    })

    it('should remove tag when clicked', () => {
        const allOptions = Object.values(ReportIssueOption)

        const onChange = jest.fn()

        const {getAllByTestId} = render(
            <FeedbackReportIssue value={allOptions} onChange={onChange} />
        )

        const tags = getAllByTestId('tag')
        expect(tags).toHaveLength(allOptions.length)

        const firstTag = tags[0]

        const firstTagTrailIcon = firstTag.querySelector(
            '[data-testid="tag-trail-icon"]'
        )

        fireEvent.click(firstTagTrailIcon!)

        expect(onChange).toHaveBeenCalledWith(allOptions.slice(1))
    })

    it('should add option when clicked', () => {
        const onChange = jest.fn()

        const {getAllByTestId, getByRole} = render(
            <FeedbackReportIssue value={[]} onChange={onChange} />
        )

        const listBox = getByRole('listbox')
        fireEvent.focus(listBox)

        const dropdownItem = getAllByTestId('dropdown-item')
        fireEvent.click(dropdownItem[0])

        const firstElement = getFirstEnumValue()
        expect(onChange).toHaveBeenCalledWith([firstElement])
    })

    it('should remove option when clicked', () => {
        const onChange = jest.fn()

        const firstElement = getFirstEnumValue()
        const {getAllByTestId, getByRole} = render(
            <FeedbackReportIssue value={[firstElement]} onChange={onChange} />
        )

        const listBox = getByRole('listbox')
        fireEvent.focus(listBox)

        const dropdownItem = getAllByTestId('dropdown-item')
        fireEvent.click(dropdownItem[0])

        expect(onChange).toHaveBeenCalledWith([])
    })
})
