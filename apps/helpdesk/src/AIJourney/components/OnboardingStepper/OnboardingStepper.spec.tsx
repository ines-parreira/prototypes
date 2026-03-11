import React from 'react'

import { render, screen } from '@testing-library/react'

import { StepperItemState, StepperTabItem } from '@gorgias/axiom'
import type { StepperTabItemProps } from '@gorgias/axiom'

import { STEPS_NAMES } from 'AIJourney/constants'

import { OnboardingStepper } from './OnboardingStepper'

jest.mock('@gorgias/axiom', () => {
    const actual = jest.requireActual('@gorgias/axiom')
    return {
        ...actual,
        Stepper: jest.fn(({ children }: { children: React.ReactNode }) => (
            <div>{children}</div>
        )),
        StepperTabList: jest.fn(
            ({ children }: { children: React.ReactNode }) => (
                <div>{children}</div>
            ),
        ),
        StepperTabItem: jest.fn(({ label }: StepperTabItemProps) => (
            <div>{label}</div>
        )),
    }
})

const mockStepperTabItem = jest.mocked(StepperTabItem)

describe('<OnboardingStepper />', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders all step labels', () => {
        render(
            <OnboardingStepper step={STEPS_NAMES.SETUP} currentStepIndex={0} />,
        )

        expect(screen.getByText('Setup')).toBeInTheDocument()
        expect(screen.getByText('Preview')).toBeInTheDocument()
        expect(screen.getByText('Test and activate')).toBeInTheDocument()
    })

    describe('step states when on Setup step (index 0)', () => {
        it('marks Setup as Current, Preview and Activate as Default', () => {
            render(
                <OnboardingStepper
                    step={STEPS_NAMES.SETUP}
                    currentStepIndex={0}
                />,
            )

            const calls = mockStepperTabItem.mock.calls
            expect(calls[0][0].state).toBe(StepperItemState.Current)
            expect(calls[1][0].state).toBe(StepperItemState.Default)
            expect(calls[2][0].state).toBe(StepperItemState.Default)
        })
    })

    describe('step states when on Preview step (index 1)', () => {
        it('marks Setup as Done, Preview as Current, Activate as Default', () => {
            render(
                <OnboardingStepper
                    step={STEPS_NAMES.PREVIEW}
                    currentStepIndex={1}
                />,
            )

            const calls = mockStepperTabItem.mock.calls
            expect(calls[0][0].state).toBe(StepperItemState.Done)
            expect(calls[1][0].state).toBe(StepperItemState.Current)
            expect(calls[2][0].state).toBe(StepperItemState.Default)
        })
    })

    describe('step states when on Activate step (index 2)', () => {
        it('marks Setup and Preview as Done, Activate as Current', () => {
            render(
                <OnboardingStepper
                    step={STEPS_NAMES.ACTIVATE}
                    currentStepIndex={2}
                />,
            )

            const calls = mockStepperTabItem.mock.calls
            expect(calls[0][0].state).toBe(StepperItemState.Done)
            expect(calls[1][0].state).toBe(StepperItemState.Done)
            expect(calls[2][0].state).toBe(StepperItemState.Current)
        })
    })

    it('passes correct step numbers to each item', () => {
        render(
            <OnboardingStepper step={STEPS_NAMES.SETUP} currentStepIndex={0} />,
        )

        const calls = mockStepperTabItem.mock.calls
        expect(calls[0][0].stepNumber).toBe(1)
        expect(calls[1][0].stepNumber).toBe(2)
        expect(calls[2][0].stepNumber).toBe(3)
    })

    it('passes correct ids to each item', () => {
        render(
            <OnboardingStepper step={STEPS_NAMES.SETUP} currentStepIndex={0} />,
        )

        const calls = mockStepperTabItem.mock.calls
        expect(calls[0][0].id).toBe(STEPS_NAMES.SETUP)
        expect(calls[1][0].id).toBe(STEPS_NAMES.PREVIEW)
        expect(calls[2][0].id).toBe(STEPS_NAMES.ACTIVATE)
    })
})
