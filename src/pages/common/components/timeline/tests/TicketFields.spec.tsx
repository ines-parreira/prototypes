import { fireEvent, render, screen } from '@testing-library/react'

import { CustomField, TicketCustomFieldValue } from '@gorgias/api-queries'

import getWrappedElementCount from 'common/utils/getWrappedElementCount'
import {
    ticketInputFieldDefinition,
    ticketNumberFieldDefinition,
} from 'fixtures/customField'
import useCallbackRef from 'hooks/useCallbackRef'
import useElementSize from 'hooks/useElementSize'
import useId from 'hooks/useId'
import { assumeMock } from 'utils/testing'

import TicketFields from '../TicketFields'

jest.mock('common/utils/getWrappedElementCount')
jest.mock('hooks/useCallbackRef')
jest.mock('hooks/useElementSize')
jest.mock('hooks/useId')

const defaultProps = {
    definitions: [ticketInputFieldDefinition as CustomField],
    fieldValues: {
        [ticketNumberFieldDefinition.id.toString()]: {
            value: 123,
        } as TicketCustomFieldValue,
        [ticketInputFieldDefinition.id.toString()]: {
            value: 'Test Value',
        } as TicketCustomFieldValue,
    },
}

const getWrappedElementCountMock = assumeMock(getWrappedElementCount)
const useCallbackRefMock = assumeMock(useCallbackRef)
const useElementSizeMock = assumeMock(useElementSize)
const useIdMock = assumeMock(useId)

describe('TicketFields', () => {
    it('should display a loading message when isLoading is true', () => {
        render(<TicketFields {...defaultProps} isLoading={true} />)

        expect(screen.getByText('Loading ticket fields...')).toBeInTheDocument()
    })

    beforeEach(() => {
        getWrappedElementCountMock.mockReturnValue(0)
        useCallbackRefMock.mockReturnValue([null, jest.fn()])
        useElementSizeMock.mockReturnValue([100, 100])
        useIdMock.mockReturnValue('test-id')
    })

    it('should display a loading message when isLoading is true', () => {
        render(<TicketFields {...defaultProps} isLoading={true} />)
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
        render(<TicketFields {...defaultProps} definitions={undefined} />)
        expect(screen.getByText('Custom Field 123')).toBeInTheDocument()
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
        render(
            <TicketFields
                {...defaultProps}
                definitions={[
                    ticketInputFieldDefinition as CustomField,
                    ticketNumberFieldDefinition as CustomField,
                ]}
            />,
        )
        expect(screen.getByText('+ 1 more')).toBeInTheDocument()
    })

    it('should call useElementSize', () => {
        render(<TicketFields {...defaultProps} />)
        expect(useElementSize).toHaveBeenCalled()
    })

    it('should display hidden ticket fields in the tooltip', () => {
        getWrappedElementCountMock.mockReturnValue(1)
        render(
            <TicketFields
                {...defaultProps}
                definitions={[
                    ticketInputFieldDefinition as CustomField,
                    ticketNumberFieldDefinition as CustomField,
                ]}
            />,
        )

        expect(
            screen.getAllByText(new RegExp(ticketNumberFieldDefinition.label)),
        ).toHaveLength(1)
        expect(
            screen.getAllByText(ticketInputFieldDefinition.id.toString()),
        ).toHaveLength(1)

        const showMore = screen.getByText('+ 1 more')
        fireEvent.focus(showMore)

        expect(
            screen.getAllByText(new RegExp(ticketNumberFieldDefinition.label)),
        ).toHaveLength(2)
        expect(
            screen.getAllByText(ticketInputFieldDefinition.id.toString()),
        ).toHaveLength(2)
    })
})
