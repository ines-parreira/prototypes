import React, {ComponentProps} from 'react'
import {fireEvent, render} from '@testing-library/react'

import RuleItemButtons from '../RuleItemButtons'

describe('<RuleItemButtons />', () => {
    const minProps: ComponentProps<typeof RuleItemButtons> = {
        ruleId: 1,
        canSubmit: true,
        canDuplicate: true,
        isDeleting: false,
        onDuplicate: jest.fn(),
        onDelete: jest.fn(),
        onSubmit: jest.fn(),
    }

    describe('rendering', () => {
        it('should render the default buttons for update', () => {
            const {container} = render(<RuleItemButtons {...minProps} />)
            expect(container.firstChild).toMatchSnapshot()
        })
        it('should render the default buttons for created', () => {
            const {container} = render(
                <RuleItemButtons {...minProps} ruleId={undefined} />
            )
            expect(container.firstChild).toMatchSnapshot()
        })
        it('should handle disabled submit', () => {
            const {queryByText} = render(
                <RuleItemButtons {...minProps} canSubmit={false} />
            )
            expect(queryByText(/update rule/i)).toMatchSnapshot()
            expect(queryByText(/duplicate rule/i)).toMatchSnapshot()
        })
        it('should handle disabled duplicate', () => {
            const {queryByText} = render(
                <RuleItemButtons {...minProps} canDuplicate={false} />
            )
            expect(queryByText(/update rule/i)).toMatchSnapshot()
            expect(queryByText(/duplicate rule/i)).toMatchSnapshot()
        })
        it('should handle deleting state', () => {
            const {queryByText} = render(
                <RuleItemButtons {...minProps} isDeleting />
            )
            expect(queryByText(/delete rule/i)).toMatchSnapshot()
        })
    })

    describe('buttons interaction', () => {
        it('should call onDuplicate on clicks', () => {
            const {getByText} = render(<RuleItemButtons {...minProps} />)
            fireEvent.click(getByText(/duplicate rule/i))
            expect(minProps.onDuplicate).toHaveBeenCalled()
        })
        it('should call onDelete on clicks', () => {
            const {getByText} = render(<RuleItemButtons {...minProps} />)
            fireEvent.click(getByText(/delete rule/i))
            fireEvent.click(getByText(/confirm/i))
            expect(minProps.onDelete).toHaveBeenCalled()
        })
    })
})
