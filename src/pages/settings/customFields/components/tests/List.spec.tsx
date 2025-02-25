import React from 'react'

import { render, screen } from '@testing-library/react'

import { ticketInputFieldDefinition } from 'fixtures/customField'
import { assumeMock } from 'utils/testing'

import List from '../List'
import Row from '../Row'

jest.mock('../Row', () =>
    jest.fn(() => {
        return (
            <tr>
                <td>This is a row</td>
            </tr>
        )
    }),
)

const MockedRow = assumeMock(Row)

describe('<List />', () => {
    it("should not render anything if there aren't any custom fields", () => {
        const props = {
            customFields: [],
            canReorder: true,
            onReorder: jest.fn(),
        }

        const { container } = render(<List {...props} />)

        expect(container.firstChild).toBeNull()
    })

    it.each([true, false])(
        'should render correct number of table headers',
        (canReorder) => {
            const props = {
                customFields: [ticketInputFieldDefinition],
                canReorder: canReorder,
                onFieldChange: jest.fn(),
                onReorder: jest.fn(),
            }

            render(<List {...props} />)

            expect(screen.getAllByRole('columnheader')).toHaveLength(6)
        },
    )

    it('should call Row component with the correct props', () => {
        const props = {
            customFields: [ticketInputFieldDefinition],
            canReorder: true,
            onReorder: jest.fn(),
        }

        render(<List {...props} />)

        expect(MockedRow).toHaveBeenCalledWith(
            {
                position: 0,
                customField: ticketInputFieldDefinition,
                canReorder: true,
                onMoveEntity: expect.any(Function),
                onDropEntity: expect.any(Function),
            },
            {},
        )
        expect(MockedRow).toHaveBeenCalledTimes(1)
        expect(screen.getByText('This is a row')).toBeInTheDocument()
    })
})
