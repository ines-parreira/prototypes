import React, {ComponentProps} from 'react'
import {fireEvent, render} from '@testing-library/react'

import RuleItemButtons from '../RuleItemButtons'

describe('<RuleItemButtons />', () => {
    const minProps: ComponentProps<typeof RuleItemButtons> = {
        ruleId: 1,
        shouldDisplayError: false,
        isSubmitDisabled: false,
        isResetting: false,
        isDeleting: false,
        onDuplicate: jest.fn(),
        onReset: jest.fn(),
        onDelete: jest.fn(),
    }

    describe('rendering', () => {
        it('should render the default buttons', () => {
            const {container} = render(<RuleItemButtons {...minProps} />)
            expect(container.firstChild).toMatchSnapshot()
        })
        it('should handle displaying an error', () => {
            const {queryByText} = render(
                <RuleItemButtons {...minProps} shouldDisplayError />
            )
            expect(queryByText(/\* name cannot be empty/i)).not.toBeNull()
        })
        it('should handle disabling submit', () => {
            const {queryByText} = render(
                <RuleItemButtons {...minProps} isSubmitDisabled />
            )
            expect(queryByText(/save rule/i)).toMatchSnapshot()
            expect(queryByText(/duplicate rule/i)).toMatchSnapshot()
        })
        it('should handle resetting state', () => {
            const {queryByText} = render(
                <RuleItemButtons {...minProps} isResetting />
            )
            expect(queryByText(/discard changes/i)).toMatchSnapshot()
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
        it('should call onReset on clicks', () => {
            const {getByText} = render(<RuleItemButtons {...minProps} />)
            fireEvent.click(getByText(/discard changes/i))
            fireEvent.click(getByText(/confirm/i))
            expect(minProps.onReset).toHaveBeenCalled()
        })
        it('should call onDelete on clicks', () => {
            const {getByText} = render(<RuleItemButtons {...minProps} />)
            fireEvent.click(getByText(/delete rule/i))
            fireEvent.click(getByText(/confirm/i))
            expect(minProps.onDelete).toHaveBeenCalled()
        })
    })
})
