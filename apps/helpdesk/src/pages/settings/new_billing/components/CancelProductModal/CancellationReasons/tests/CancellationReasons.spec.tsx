import { fireEvent, render, screen, within } from '@testing-library/react'

import { CancellationPrimaryReasonLabel } from 'pages/settings/new_billing/components/CancelProductModal/constants'
import { DEFAULT_STATE } from 'pages/settings/new_billing/components/CancelProductModal/reducers'
import { HELPDESK_CANCELLATION_SCENARIO } from 'pages/settings/new_billing/components/CancelProductModal/scenarios'
import { CancellationReasonsActionType } from 'pages/settings/new_billing/components/CancelProductModal/types'

import CancellationReasons from '../CancellationReasons'

describe('CancellationReasons - Helpdesk', () => {
    it('renders with no reasons selected', () => {
        const { container, getByText, getByRole, queryByText } = render(
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

        // Additional details should NOT be rendered until primary reason is selected
        expect(container.querySelector('textarea')).toBeNull()
        expect(queryByText('Please share any additional details')).toBeNull()
    })

    it('renders with all reasons selected including additional details', () => {
        const secondaryReason =
            HELPDESK_CANCELLATION_SCENARIO.reasons[1].secondaryReasons[0]
        const state = {
            primaryReason: {
                label: CancellationPrimaryReasonLabel.DoesNotFitMyNeeds,
            },
            secondaryReason: secondaryReason,
            additionalDetails: {
                label: 'Additional details provided by agent.',
            },
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

        const additionalDetails = screen.getByText(
            'Please share any additional details',
        )
        const additionalDetailsValue = screen.getByDisplayValue(
            state.additionalDetails.label,
        )
        expect(additionalDetails).toBeInTheDocument()
        expect(additionalDetailsValue).toBeInTheDocument()
        // No asterisk shown (not required)
        expect(within(additionalDetails).queryByText('*')).toBeNull()
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

    it('handles the change of additional details', () => {
        const mockDispatch = jest.fn()
        const primaryReason =
            HELPDESK_CANCELLATION_SCENARIO.reasons[0].primaryReason
        const secondaryReason =
            HELPDESK_CANCELLATION_SCENARIO.reasons[0].secondaryReasons[0]

        const { container } = render(
            <div>
                <CancellationReasons
                    reasons={HELPDESK_CANCELLATION_SCENARIO.reasons}
                    reasonsState={{
                        ...DEFAULT_STATE,
                        primaryReason: primaryReason,
                        secondaryReason: secondaryReason,
                    }}
                    dispatchCancellationReasonsAction={mockDispatch}
                />
            </div>,
        )

        const newDetails = { label: 'New details' }
        const textArea = container.querySelector('textarea') as Element
        fireEvent.change(textArea, { target: { value: newDetails.label } })
        expect(mockDispatch).toHaveBeenCalledWith({
            type: CancellationReasonsActionType.AdditionalDetailsUpdated,
            additionalDetails: newDetails,
        })
    })

    it('should show additional details as optional after primary reason is selected', () => {
        const { queryByText } = render(
            <div>
                <CancellationReasons
                    reasons={HELPDESK_CANCELLATION_SCENARIO.reasons}
                    reasonsState={{
                        ...DEFAULT_STATE,
                        primaryReason: {
                            label: CancellationPrimaryReasonLabel.Pricing,
                        },
                        secondaryReason:
                            HELPDESK_CANCELLATION_SCENARIO.reasons[0]
                                .secondaryReasons[0],
                    }}
                    dispatchCancellationReasonsAction={jest.fn() as any}
                />
            </div>,
        )

        const additionalDetailsLabel = queryByText(
            'Please share any additional details',
        )
        expect(additionalDetailsLabel).toBeInTheDocument()

        // Should not have asterisk (not required)
        expect(
            within(additionalDetailsLabel as HTMLElement).queryByText('*'),
        ).toBeNull()
    })
})
