import { render, screen } from '@testing-library/react'

import { Form } from 'core/forms'
import { assumeMock } from 'utils/testing'

import ListCustomBusinessHours from '../ListCustomBusinessHours'
import ListCustomBusinessHoursTableRow from '../ListCustomBusinessHoursTableRow'

jest.mock('../ListCustomBusinessHoursTableRow')
const ListCustomBusinessHoursTableRowMock = assumeMock(
    ListCustomBusinessHoursTableRow,
)

describe('ListCustomBusinessHours', () => {
    beforeEach(() => {
        ListCustomBusinessHoursTableRowMock.mockReturnValue(
            <div>ListCustomBusinessHoursTableRow</div>,
        )
    })

    it('should render', () => {
        render(
            <Form onValidSubmit={jest.fn()}>
                <ListCustomBusinessHours />
            </Form>,
        )

        expect(screen.getByText('Name & Schedule')).toBeInTheDocument()
        expect(screen.getByText('Integration')).toBeInTheDocument()
        expect(screen.getByText('Timezone')).toBeInTheDocument()
        expect(
            screen.getAllByText('ListCustomBusinessHoursTableRow'),
        ).toHaveLength(3)
    })

    it('should render skeleton when loading', () => {
        const { container } = render(
            <Form onValidSubmit={jest.fn()}>
                <ListCustomBusinessHours isLoading />
            </Form>,
        )

        expect(
            screen.queryByText('ListCustomBusinessHoursTableRow'),
        ).not.toBeInTheDocument()

        const skeletons = container.querySelectorAll(
            '[class^="react-loading-skeleton"]',
        )
        expect(skeletons.length).toBeGreaterThan(0)
    })
})
