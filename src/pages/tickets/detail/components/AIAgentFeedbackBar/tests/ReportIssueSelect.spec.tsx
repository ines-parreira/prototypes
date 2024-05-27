import React from 'react'
import {fireEvent, render} from '@testing-library/react'

import {
    ReportIssueLabels,
    ReportIssueOption,
} from 'models/aiAgentFeedback/constants'

import ReportIssueSelect from '../ReportIssueSelect'

describe('ReportIssueSelect', () => {
    it('displays tags for each value', () => {
        const allOptions = Object.values(ReportIssueOption)

        const {getAllByTestId} = render(
            <ReportIssueSelect value={allOptions} onChange={jest.fn()} />
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
            <ReportIssueSelect value={allOptions} onChange={onChange} />
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
            <ReportIssueSelect value={[]} onChange={onChange} />
        )

        const listBox = getByRole('listbox')
        fireEvent.focus(listBox)

        const dropdownItem = getAllByTestId('dropdown-item')
        fireEvent.click(dropdownItem[0])

        expect(onChange).toHaveBeenCalledWith([
            ReportIssueOption.IncorrectLanguageUsed,
        ])
    })

    it('should remove option when clicked', () => {
        const onChange = jest.fn()

        const {getAllByTestId, getByRole} = render(
            <ReportIssueSelect
                value={[ReportIssueOption.IncorrectLanguageUsed]}
                onChange={onChange}
            />
        )

        const listBox = getByRole('listbox')
        fireEvent.focus(listBox)

        const dropdownItem = getAllByTestId('dropdown-item')
        fireEvent.click(dropdownItem[0])

        expect(onChange).toHaveBeenCalledWith([])
    })
})
