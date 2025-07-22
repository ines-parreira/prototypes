import React from 'react'

import { act, fireEvent, render } from '@testing-library/react'

import { FILTER_WARNING_ICON } from 'domains/reporting/pages/common/components/Filter/constants'
import {
    DEFAULT_BADGE_TEXT,
    FiltersEditableTitle,
    getTooltipContent,
    NOT_APPLICABLE_ERROR,
    NOT_EXISTENT_ADMIN_ERROR,
    NOT_EXISTENT_AGENT_ERROR,
} from 'domains/reporting/pages/common/filters/FiltersEditableTitle/FiltersEditableTitle'
import useAppSelector from 'hooks/useAppSelector'
import { isTeamLead } from 'utils'
import { assumeMock } from 'utils/testing'
import { userEvent } from 'utils/testing/userEvent'

jest.mock('utils')
const isTeamLeadMock = assumeMock(isTeamLead)
jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = assumeMock(useAppSelector)
jest.mock('state/currentUser/selectors', () => ({
    getCurrentUser: jest.fn(),
}))

const toggleIsEditModeMock = jest.fn()

describe('FiltersEditableTitle', () => {
    beforeEach(() => {
        useAppSelectorMock.mockReturnValueOnce({})
        isTeamLeadMock.mockReturnValueOnce(false)
    })

    it('should render the component', () => {
        const { getByText, queryByText, container } = render(
            <FiltersEditableTitle
                isEditMode={false}
                title="Filter title"
                toggleIsEditMode={() => {}}
                onChange={jest.fn()}
            />,
        )

        expect(getByText('Filter title')).toBeTruthy()

        expect(getByText('tune')).toBeTruthy()

        expect(
            container.getElementsByClassName('material-icons icon').length,
        ).toBe(1)

        expect(queryByText(FILTER_WARNING_ICON)).toBeFalsy()
    })

    it('should render the component with edit mode without the error icon', () => {
        const { getByText, queryByText, container, getByPlaceholderText } =
            render(
                <FiltersEditableTitle
                    isEditMode={true}
                    title=""
                    toggleIsEditMode={toggleIsEditModeMock}
                    errorType="non-existent"
                    onChange={jest.fn()}
                />,
            )

        expect(getByText('tune')).toBeTruthy()

        expect(container.querySelector('#input-text-1')).toBeInTheDocument()

        const input = getByPlaceholderText(/Name Filter/i)

        fireEvent.change(input, { target: { value: 'New value' } })

        expect(queryByText(FILTER_WARNING_ICON)).toBeFalsy()
    })

    it('should only have the error icon on read mode', () => {
        const { getByText, container } = render(
            <FiltersEditableTitle
                isEditMode={false}
                title=""
                toggleIsEditMode={() => {}}
                errorType="non-existent"
                onChange={jest.fn()}
            />,
        )

        expect(
            container.getElementsByClassName(
                'material-icons icon disableTuneIcon',
            ).length,
        ).toBe(1)

        expect(getByText(FILTER_WARNING_ICON)).toBeInTheDocument()
    })

    it('should render the component and switch to edit mode', () => {
        const { getByText } = render(
            <FiltersEditableTitle
                isEditMode={false}
                title="Filter title"
                toggleIsEditMode={toggleIsEditModeMock}
                errorType="non-existent"
                onChange={jest.fn()}
            />,
        )

        act(() => {
            userEvent.click(getByText('Filter title'))
        })

        expect(toggleIsEditModeMock).toHaveBeenCalledWith(true)
    })

    it('should render the component with the default badge', () => {
        const { getByText } = render(
            <FiltersEditableTitle
                isEditMode={false}
                title="Filter title"
                toggleIsEditMode={toggleIsEditModeMock}
                onChange={jest.fn()}
                isPinned
            />,
        )

        expect(getByText('Filter title')).toBeTruthy()

        expect(getByText(DEFAULT_BADGE_TEXT)).toBeTruthy()
    })
})

describe('getTooltipContent', () => {
    it.each([
        [false, 'non-existent', NOT_EXISTENT_AGENT_ERROR],
        [true, 'non-existent', NOT_EXISTENT_ADMIN_ERROR],
        [false, 'not-applicable', NOT_APPLICABLE_ERROR],
        [true, 'not-applicable', NOT_APPLICABLE_ERROR],
    ])(
        'should return the right error message ',
        (canEdit, errorType, expected) => {
            expect(getTooltipContent(canEdit, errorType as any)).toEqual(
                expected,
            )
        },
    )
})
