import { useCallbackRef, useElementSize, useId } from '@repo/hooks'
import { assumeMock } from '@repo/testing'
import { fireEvent, render, screen } from '@testing-library/react'

import {
    TicketCustomFieldValue,
    useListCustomFields,
} from '@gorgias/helpdesk-queries'

import getWrappedElementCount from 'common/utils/getWrappedElementCount'
import { apiListCursorPaginationResponse } from 'fixtures/axiosResponse'
import {
    ticketInputFieldDefinition,
    ticketNumberFieldDefinition,
} from 'fixtures/customField'

import TicketFields from '../TicketFields'

jest.mock('@gorgias/helpdesk-queries', () => ({
    ...jest.requireActual('@gorgias/helpdesk-queries'),
    useListCustomFields: jest.fn(),
}))
jest.mock('common/utils/getWrappedElementCount')

jest.mock('@repo/hooks', () => ({
    ...jest.requireActual('@repo/hooks'),
    useCallbackRef: jest.fn(() => [null, jest.fn()]),
    useElementSize: jest.fn(),
    useId: jest.fn(),
}))

const defaultProps = {
    fieldValues: {
        [ticketNumberFieldDefinition.id.toString()]: {
            value: 123,
        } as TicketCustomFieldValue,
        [ticketInputFieldDefinition.id.toString()]: {
            value: 'Test Value',
        } as TicketCustomFieldValue,
    },
}

const defaultFieldDefinitions = {
    data: {
        data: apiListCursorPaginationResponse([ticketInputFieldDefinition]),
    },
    isLoading: false,
} as ReturnType<typeof useListCustomFields>

const dualFieldDefinitions = {
    data: {
        data: apiListCursorPaginationResponse([
            ticketInputFieldDefinition,
            ticketNumberFieldDefinition,
        ]),
    },
    isLoading: false,
} as ReturnType<typeof useListCustomFields>

const useListCustomFieldsMock = assumeMock(useListCustomFields)
const getWrappedElementCountMock = assumeMock(getWrappedElementCount)
const useCallbackRefMock = assumeMock(useCallbackRef)
const useElementSizeMock = assumeMock(useElementSize)
const useIdMock = assumeMock(useId)

describe('TicketFields', () => {
    beforeEach(() => {
        useListCustomFieldsMock.mockReturnValue(defaultFieldDefinitions)
        getWrappedElementCountMock.mockReturnValue(0)
        useCallbackRefMock.mockReturnValue([null, jest.fn()])
        useElementSizeMock.mockReturnValue([100, 100])
        useIdMock.mockReturnValue('test-id')
    })

    it('should display a loading message when isLoading is true', () => {
        useListCustomFieldsMock.mockReturnValue({
            data: undefined,
            isLoading: true,
        } as ReturnType<typeof useListCustomFields>)
        render(<TicketFields {...defaultProps} />)

        expect(screen.getByText('Loading ticket fields...')).toBeInTheDocument()
    })

    it('should display a message when there are no ticket fields', () => {
        const { rerender } = render(
            <TicketFields {...defaultProps} fieldValues={null} />,
        )
        expect(screen.getByText('No ticket fields yet')).toBeInTheDocument()

        rerender(<TicketFields {...defaultProps} fieldValues={undefined} />)
        expect(screen.getByText('No ticket fields yet')).toBeInTheDocument()
    })

    it('should display a default label when there is no matching definition', () => {
        render(<TicketFields {...defaultProps} />)
        expect(screen.getByText('Custom Field 1234')).toBeInTheDocument()
    })

    it('should display ticket fields when they are available', () => {
        render(<TicketFields {...defaultProps} />)
        expect(
            screen.getByText(ticketInputFieldDefinition.label),
        ).toBeInTheDocument()
        expect(screen.getByText('Test Value')).toBeInTheDocument()
    })

    it('should display the correct number of hidden ticket fields', () => {
        getWrappedElementCountMock.mockReturnValue(1)
        useListCustomFieldsMock.mockReturnValue(dualFieldDefinitions)
        render(<TicketFields {...defaultProps} />)
        expect(screen.getByText('+1 more')).toBeInTheDocument()
    })

    it('should call useElementSize', () => {
        render(<TicketFields {...defaultProps} />)
        expect(useElementSize).toHaveBeenCalled()
    })

    it('should display hidden ticket fields in the tooltip', () => {
        getWrappedElementCountMock.mockReturnValue(1)
        useListCustomFieldsMock.mockReturnValue(dualFieldDefinitions)
        render(<TicketFields {...defaultProps} />)

        expect(
            screen.getAllByText(new RegExp(ticketNumberFieldDefinition.label)),
        ).toHaveLength(1)
        expect(
            screen.getAllByText(ticketInputFieldDefinition.id.toString()),
        ).toHaveLength(1)

        const showMore = screen.getByText('+1 more')
        fireEvent.focus(showMore)

        expect(
            screen.getAllByText(new RegExp(ticketNumberFieldDefinition.label)),
        ).toHaveLength(2)
        expect(
            screen.getAllByText(ticketInputFieldDefinition.id.toString()),
        ).toHaveLength(2)
    })

    it('should not hide any ticket fields when multiline is true', () => {
        render(<TicketFields {...defaultProps} isMultiline />)

        expect(screen.queryByText('+1 more')).not.toBeInTheDocument()
    })

    it('should apply the correct classNames when isBold is true', () => {
        render(<TicketFields {...defaultProps} isBold />)

        expect(screen.getByText('Test Value')).toHaveClass('bold')
    })
})
