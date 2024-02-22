import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import CancellationReasons from '../CancellationReasons'
import {DEFAULT_STATE} from '../../reducers'
import {CommonReasonLabel, HelpdeskPrimaryReasonLabel} from '../../constants'
import {CancellationReasonsActionType} from '../../types'
import {HELPDESK_CANCELLATION_SCENARIO} from '../../scenarios'

describe('CancellationReasons - Helpdesk', () => {
    it('renders with no reasons selected', () => {
        const {container, getByText, getByRole} = render(
            <CancellationReasons
                reasons={HELPDESK_CANCELLATION_SCENARIO.reasons}
                reasonsState={DEFAULT_STATE}
                dispatchCancellationReasonsAction={jest.fn() as any}
            />
        )

        const opinionElement = getByText(
            'Your opinion means a lot to us. Please tell us why you are cancelling your plan.'
        )
        expect(opinionElement).toBeInTheDocument()

        const instructionElement = container.querySelector(
            'div[class=instruction]'
        )
        expect(instructionElement).toHaveTextContent('Cancellation reason*')

        const selectorElement = getByRole('listbox')
        expect(selectorElement).toBeInTheDocument()

        // No other reason rendered
        expect(container.querySelector('textarea')).toBeNull()
    })

    it('renders with all reasons selected', () => {
        const state = {
            primaryReason: {
                label: HelpdeskPrimaryReasonLabel.DoesNotFitMyNeeds,
            },
            secondaryReason: {label: CommonReasonLabel.Other},
            otherReason: {label: 'Other reason provided by agent.'},
            completed: true,
        }

        const {container, getByText, getByRole, getByTestId} = render(
            <CancellationReasons
                reasons={HELPDESK_CANCELLATION_SCENARIO.reasons}
                reasonsState={state}
                dispatchCancellationReasonsAction={jest.fn() as any}
            />
        )
        const opinionElement = getByText(
            'Your opinion means a lot to us. Please tell us why you are cancelling your plan.'
        )
        expect(opinionElement).toBeInTheDocument()

        const instructionElement = container.querySelector(
            'div[class=instruction]'
        )
        expect(instructionElement).toHaveTextContent('Cancellation reason*')

        const selectorElement = getByRole('listbox')
        expect(selectorElement).toHaveTextContent(state.primaryReason.label)

        const secondaryReasons = getByTestId('secondary-reasons-selector')
        expect(secondaryReasons).toBeInTheDocument()
        expect(secondaryReasons).toHaveTextContent(state.secondaryReason.label)

        const otherReason = getByTestId('other-reason')
        expect(otherReason).toBeInTheDocument()
        expect(otherReason).toHaveTextContent(state.otherReason.label)
    })

    it('renders with Other primary reason', () => {
        const mockDispatch = jest.fn()
        const state = {
            ...DEFAULT_STATE,
            primaryReason: {label: CommonReasonLabel.Other},
        }

        const {getByTestId} = render(
            <div>
                <CancellationReasons
                    reasons={HELPDESK_CANCELLATION_SCENARIO.reasons}
                    reasonsState={state}
                    dispatchCancellationReasonsAction={mockDispatch}
                />
            </div>
        )

        expect(getByTestId('other-reason')).toBeInTheDocument()
    })

    it('renders with "I prefer not to say" primary reason', () => {
        const mockDispatch = jest.fn()
        const state = {
            ...DEFAULT_STATE,
            primaryReason: {label: CommonReasonLabel.IPreferNotToSay},
        }

        const {container} = render(
            <div>
                <CancellationReasons
                    reasons={HELPDESK_CANCELLATION_SCENARIO.reasons}
                    reasonsState={state}
                    dispatchCancellationReasonsAction={mockDispatch}
                />
            </div>
        )

        // No secondary reasons rendered
        expect(container.querySelector('fieldset')).toBeNull()

        // No other reason rendered
        expect(container.querySelector('textarea')).toBeNull()
    })

    it('handles the change of primary reason', () => {
        const mockDispatch = jest.fn()
        const {getByText} = render(
            <div>
                <CancellationReasons
                    reasons={HELPDESK_CANCELLATION_SCENARIO.reasons}
                    reasonsState={DEFAULT_STATE}
                    dispatchCancellationReasonsAction={mockDispatch}
                />
            </div>
        )

        const selectorElement = getByText('Select reason...')
        fireEvent.focus(selectorElement as Element)
        fireEvent.click(getByText(CommonReasonLabel.IPreferNotToSay))

        expect(mockDispatch).toHaveBeenCalledWith({
            type: CancellationReasonsActionType.PrimaryReasonSelected,
            primaryReason: {
                label: CommonReasonLabel.IPreferNotToSay,
            },
        })
    })

    it('handles the change of secondary reason', () => {
        const mockDispatch = jest.fn()
        const primaryReason =
            HELPDESK_CANCELLATION_SCENARIO.reasons[0].primaryReason
        const secondaryReason =
            HELPDESK_CANCELLATION_SCENARIO.reasons[0].secondaryReasons[0]

        const {getByText} = render(
            <div>
                <CancellationReasons
                    reasons={HELPDESK_CANCELLATION_SCENARIO.reasons}
                    reasonsState={{
                        ...DEFAULT_STATE,
                        primaryReason: primaryReason,
                    }}
                    dispatchCancellationReasonsAction={mockDispatch}
                />
            </div>
        )

        fireEvent.click(getByText(secondaryReason.label))
        expect(mockDispatch).toHaveBeenCalledWith({
            type: CancellationReasonsActionType.SecondaryReasonSelected,
            secondaryReason: {label: secondaryReason.label},
        })
    })

    it('handles the change of other reason', () => {
        const mockDispatch = jest.fn()
        const primaryReason = {label: CommonReasonLabel.Other}

        const {container} = render(
            <div>
                <CancellationReasons
                    reasons={HELPDESK_CANCELLATION_SCENARIO.reasons}
                    reasonsState={{
                        ...DEFAULT_STATE,
                        primaryReason: primaryReason,
                    }}
                    dispatchCancellationReasonsAction={mockDispatch}
                />
            </div>
        )

        const newOtherReason = {label: 'New reason'}
        const textArea = container.querySelector('textarea') as Element
        fireEvent.change(textArea, {target: {value: newOtherReason.label}})
        expect(mockDispatch).toHaveBeenCalledWith({
            type: CancellationReasonsActionType.OtherReasonUpdated,
            otherReason: newOtherReason,
        })
    })
})
