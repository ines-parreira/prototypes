import { fireEvent, render, screen, within } from '@testing-library/react'

import {
    CancellationPrimaryReasonLabel,
    CommonReasonLabel,
} from 'pages/settings/new_billing/components/CancelProductModal/constants'
import { DEFAULT_STATE } from 'pages/settings/new_billing/components/CancelProductModal/reducers'
import { HELPDESK_CANCELLATION_SCENARIO } from 'pages/settings/new_billing/components/CancelProductModal/scenarios'
import { CancellationReasonsActionType } from 'pages/settings/new_billing/components/CancelProductModal/types'

import CancellationReasons from '../CancellationReasons'

describe('CancellationReasons - Helpdesk', () => {
    it('renders with no reasons selected', () => {
        const { container, getByText, getByRole } = render(
            <CancellationReasons
                reasons={HELPDESK_CANCELLATION_SCENARIO.reasons}
                reasonsState={DEFAULT_STATE}
                dispatchCancellationReasonsAction={jest.fn() as any}
            />,
        )

        const opinionElement = getByText(
            'Your opinion means a lot to us. Please tell us why you are cancelling your plan.',
        )
        expect(opinionElement).toBeInTheDocument()

        const instructionElement = container.querySelector(
            'div[class=instruction]',
        )
        expect(instructionElement).toHaveTextContent('Cancellation reason*')

        const selectorElement = getByRole('combobox')
        expect(selectorElement).toBeInTheDocument()

        // No other reason rendered
        expect(container.querySelector('textarea')).toBeNull()
    })

    it('renders with all reasons selected', () => {
        const state = {
            primaryReason: {
                label: CancellationPrimaryReasonLabel.DoesNotFitMyNeeds,
            },
            secondaryReason: { label: CommonReasonLabel.Other },
            otherReason: { label: 'Other reason provided by agent.' },
            completed: true,
        }

        const { container, getByText, getByRole } = render(
            <CancellationReasons
                reasons={HELPDESK_CANCELLATION_SCENARIO.reasons}
                reasonsState={state}
                dispatchCancellationReasonsAction={jest.fn() as any}
            />,
        )
        const opinionElement = getByText(
            'Your opinion means a lot to us. Please tell us why you are cancelling your plan.',
        )
        expect(opinionElement).toBeInTheDocument()

        const instructionElement = container.querySelector(
            'div[class=instruction]',
        )
        expect(instructionElement).toHaveTextContent('Cancellation reason*')

        const selectorElement = getByRole('combobox')
        expect(selectorElement).toHaveTextContent(state.primaryReason.label)

        const secondaryReasons = screen.getByText(
            'Could you please share more?',
        )
        const secondaryReasonsValue = screen.getByLabelText(
            state.secondaryReason.label,
        )
        expect(secondaryReasons).toBeInTheDocument()
        expect(secondaryReasonsValue).toBeChecked()

        const otherReason = screen.getByText(
            'Please share any additional details',
        )
        const otherReasonValue = screen.getByDisplayValue(
            state.otherReason.label,
        )
        expect(otherReason).toBeInTheDocument()
        expect(otherReasonValue).toBeInTheDocument()
    })

    it('renders with Other primary reason', () => {
        const mockDispatch = jest.fn()
        const state = {
            ...DEFAULT_STATE,
            primaryReason: { label: CommonReasonLabel.Other },
        }

        render(
            <div>
                <CancellationReasons
                    reasons={HELPDESK_CANCELLATION_SCENARIO.reasons}
                    reasonsState={state}
                    dispatchCancellationReasonsAction={mockDispatch}
                />
            </div>,
        )

        expect(
            screen.getByText('Please share any additional details'),
        ).toBeInTheDocument()
    })

    it('handles the change of primary reason', () => {
        const mockDispatch = jest.fn()
        const { getByText } = render(
            <div>
                <CancellationReasons
                    reasons={HELPDESK_CANCELLATION_SCENARIO.reasons}
                    reasonsState={DEFAULT_STATE}
                    dispatchCancellationReasonsAction={mockDispatch}
                />
            </div>,
        )

        const selectorElement = getByText('Select reason...')
        fireEvent.focus(selectorElement as Element)
        fireEvent.click(getByText(CommonReasonLabel.Other))

        expect(mockDispatch).toHaveBeenCalledWith({
            type: CancellationReasonsActionType.PrimaryReasonSelected,
            primaryReason: {
                label: CommonReasonLabel.Other,
            },
        })
    })

    it('handles the change of secondary reason', () => {
        const mockDispatch = jest.fn()
        const primaryReason =
            HELPDESK_CANCELLATION_SCENARIO.reasons[0].primaryReason
        const secondaryReason =
            HELPDESK_CANCELLATION_SCENARIO.reasons[0].secondaryReasons[0]

        const { getByText } = render(
            <div>
                <CancellationReasons
                    reasons={HELPDESK_CANCELLATION_SCENARIO.reasons}
                    reasonsState={{
                        ...DEFAULT_STATE,
                        primaryReason: primaryReason,
                    }}
                    dispatchCancellationReasonsAction={mockDispatch}
                />
            </div>,
        )

        fireEvent.click(getByText(secondaryReason.label))
        expect(mockDispatch).toHaveBeenCalledWith({
            type: CancellationReasonsActionType.SecondaryReasonSelected,
            secondaryReason: { label: secondaryReason.label },
        })
    })

    it('handles the change of other reason', () => {
        const mockDispatch = jest.fn()
        const primaryReason = { label: CommonReasonLabel.Other }

        const { container } = render(
            <div>
                <CancellationReasons
                    reasons={HELPDESK_CANCELLATION_SCENARIO.reasons}
                    reasonsState={{
                        ...DEFAULT_STATE,
                        primaryReason: primaryReason,
                    }}
                    dispatchCancellationReasonsAction={mockDispatch}
                />
            </div>,
        )

        const newOtherReason = { label: 'New reason' }
        const textArea = container.querySelector('textarea') as Element
        fireEvent.change(textArea, { target: { value: newOtherReason.label } })
        expect(mockDispatch).toHaveBeenCalledWith({
            type: CancellationReasonsActionType.OtherReasonUpdated,
            otherReason: newOtherReason,
        })
    })

    it('should show the additional details as required when "Other" is selected as secondary reason', () => {
        render(
            <div>
                <CancellationReasons
                    reasons={HELPDESK_CANCELLATION_SCENARIO.reasons}
                    reasonsState={{
                        ...DEFAULT_STATE,
                        primaryReason: {
                            label: CancellationPrimaryReasonLabel.DoesNotFitMyNeeds,
                        },
                        secondaryReason: { label: CommonReasonLabel.Other },
                    }}
                    dispatchCancellationReasonsAction={jest.fn() as any}
                />
            </div>,
        )

        expect(
            within(
                screen.getByText('Please share any additional details'),
            ).getByText('*'),
        ).toBeVisible()
    })
})
