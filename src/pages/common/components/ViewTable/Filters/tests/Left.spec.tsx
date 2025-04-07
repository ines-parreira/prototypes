import { ComponentProps } from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'

import { view } from 'fixtures/views'
import CustomFieldSelect from 'pages/common/components/ast/widget/CustomFieldSelect'
import Left from 'pages/common/components/ViewTable/Filters/Left'
import QAScoreSelect from 'pages/common/components/ViewTable/Filters/QAScoreSelect'
import { assumeMock } from 'utils/testing'

import { QaScoreDimensions } from '../utils/qaScoreDimensions'

jest.mock('pages/common/components/ViewTable/Filters/QAScoreSelect')
const QAScoreDimensionSelectMock = assumeMock(QAScoreSelect)

jest.mock('pages/common/components/ast/widget/CustomFieldSelect')
const CustomFieldSelectMock = assumeMock(CustomFieldSelect)

const renderComponent = (props: ComponentProps<typeof Left>) =>
    render(<Left {...props} />)

describe('<Left />', () => {
    const props = {
        objectPath: 'ticket.qa_score_dimensions',
        view: fromJS(view),
        onCustomFieldChange: jest.fn(),
        onQAScoreDimensionFieldChange: jest.fn(),
    }

    beforeEach(() => {
        QAScoreDimensionSelectMock.mockImplementation(() => (
            <div>QA Score Dimension Select</div>
        ))
        CustomFieldSelectMock.mockImplementation(() => (
            <div>Custom Field Select</div>
        ))
    })

    it('should render the correct title for a QA Score field', () => {
        const { getByText } = renderComponent({
            ...props,
            objectPath: 'ticket.qa_score_dimensions',
        })

        expect(getByText('QA Score')).toBeInTheDocument()
    })

    it('should render the correct title for a Custom Field', () => {
        const { getByText } = renderComponent({
            ...props,
            objectPath: 'ticket.custom_fields',
        })

        expect(getByText('Ticket field')).toBeInTheDocument()
    })

    it('should render the default title for an unknown field', () => {
        const { getByText } = renderComponent({
            ...props,
            objectPath: 'ticket.unknown_field',
        })

        expect(getByText('Unknown field')).toBeInTheDocument()
    })

    it('should render QAScoreSelect when the objectPath includes "qa_score_dimensions"', () => {
        const { getByText } = renderComponent({
            ...props,
            objectPath: `ticket.qa_score_dimensions[${QaScoreDimensions.ACCURACY}]`,
        })

        expect(getByText('QA Score Dimension Select')).toBeInTheDocument()
        expect(QAScoreDimensionSelectMock).toHaveBeenCalledWith(
            expect.objectContaining({ value: 'accuracy' }),
            {},
        )
    })

    it('should render CustomFieldSelect when the objectPath includes "custom_fields"', () => {
        const { getByText } = renderComponent({
            ...props,
            objectPath: 'ticket.custom_fields[123].value',
        })

        expect(getByText('Custom Field Select')).toBeInTheDocument()
        expect(CustomFieldSelectMock).toHaveBeenCalledWith(
            expect.objectContaining({ value: 123 }),
            {},
        )
    })
})
