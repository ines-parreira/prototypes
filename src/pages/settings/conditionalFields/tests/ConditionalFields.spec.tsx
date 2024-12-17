import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {Link} from 'react-router-dom'

import {SegmentEvent, logEvent} from 'common/segment'
// import {apiListCursorPaginationResponse} from 'fixtures/axiosResponse'
import useDebouncedValue from 'hooks/useDebouncedValue'
import {assumeMock, getLastMockCall} from 'utils/testing'

import ConditionalFields /*, {MAX_CONDITIONS} */ from '../ConditionalFields'

jest.mock(
    'common/segment',
    () =>
        ({
            ...jest.requireActual('common/segment'),
            logEvent: jest.fn(),
        }) as Record<string, unknown>
)
jest.mock(
    'react-router-dom',
    () =>
        ({
            ...jest.requireActual('react-router-dom'),
            Link: jest.fn(
                ({children}: {children: React.ReactNode}) => children
            ),
        }) as Record<string, unknown>
)

jest.mock('hooks/useDebouncedValue')

const useDebouncedValueMock = assumeMock(useDebouncedValue)
const mockedLogEvent = assumeMock(logEvent)
const mockedLink = assumeMock(Link)

describe('<CustomFields/>', () => {
    beforeEach(() => {
        useDebouncedValueMock.mockReturnValue('')
    })

    it('should render get started', () => {
        render(<ConditionalFields />)

        expect(
            screen.getByText(/Get started with Conditional Fields/)
        ).toBeDefined()
        // expect(screen.queryByTestId('custom-fields-list')).toBeNull()
    })

    it("should render a 'Create Condition' button", () => {
        render(<ConditionalFields />)

        const createConditionButton = screen.getByRole('button', {
            name: 'Create Condition',
        })
        expect(createConditionButton).toBeInTheDocument()
        getLastMockCall(mockedLink)[0].onClick?.(
            {} as React.MouseEvent<HTMLAnchorElement, MouseEvent>
        )
        expect(mockedLogEvent).toHaveBeenCalledWith(
            SegmentEvent.CustomFieldCreateConditionClicked
        )
    })

    // it('should disable the create button when max limit is reached and display an alert', () => {
    //     useFieldConditionsMock.mockReturnValue({
    //         data: apiListCursorPaginationResponse(
    //             Array.from({length: MAX_CONDITIONS}, () => FieldCondition)
    //         ),
    //         isLoading: false,
    //     } as unknown as ReturnType<typeof useFieldConditions>)

    //     render(<ConditionalFields />)

    //     expect(
    //         screen.getByText(/Please archive some fields before creating/)
    //     ).toBeDefined()
    //     expect(
    //         screen.getByRole('button', {name: 'Create Field'})
    //     ).toBeAriaDisabled()
    // })

    it('should render no results found', async () => {
        useDebouncedValueMock.mockReturnValue('foo')

        render(<ConditionalFields />)
        await userEvent.type(
            screen.getByPlaceholderText('Search condition...'),
            'foo'
        )
        await waitFor(() => {
            expect(useDebouncedValue).toHaveBeenLastCalledWith('foo', 300)
        })
        expect(screen.getByText(/No results found./)).toBeInTheDocument()
    })
})
