import React from 'react'

import { render, RenderResult, screen } from '@testing-library/react'

import { VoiceQueueTargetScope } from '@gorgias/api-queries'

import { FormField, useFormContext } from 'core/forms'
import * as forms from 'core/forms'
import { assumeMock } from 'utils/testing'

import VoiceQueueSettingsFormCallFlowSection from '../VoiceQueueSettingsFormCallFlowSection'

const formFieldSpy = jest.spyOn(forms, 'FormField')

jest.mock('core/forms')
const FormFieldMock = assumeMock(FormField)

jest.mock('models/team/queries', () => ({
    useListTeams: jest.fn(),
}))

const watchMock = jest.fn()
const setValueMock = jest.fn()
const mockUseFormContextReturnValue = {
    watch: watchMock,
    setValue: setValueMock,
} as unknown as ReturnType<typeof useFormContext>

jest.mock('react-hook-form')
const useFormContextMock = assumeMock(useFormContext)

describe('<VoiceQueueSettingsFormCallFlowSection />', () => {
    const renderComponent = (props: any = {}): RenderResult => {
        return render(<VoiceQueueSettingsFormCallFlowSection {...props} />)
    }

    beforeEach(() => {
        FormFieldMock.mockImplementation(({ label }: any) => <div>{label}</div>)
        watchMock.mockReturnValue([[], 5, 5] as any)
        useFormContextMock.mockReturnValue(mockUseFormContextReturnValue)
    })

    it('should display team select, ringing behavior, and ring time per agent', () => {
        renderComponent()

        expect(screen.getByText('Distribution mode')).toBeInTheDocument()
        expect(screen.getByText('Ring time per agent')).toBeInTheDocument()
        expect(
            screen.getByText('Customize how calls are routed'),
        ).toBeInTheDocument()
        expect(FormFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'distribution_mode',
            }),
            {},
        )
        expect(FormFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'linked_targets',
            }),
            {},
        )
        expect(FormFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'ring_time',
            }),
            {},
        )
    })

    it.each`
        linked_targets | expectedTargetScope
        ${[]}          | ${VoiceQueueTargetScope.AllAgents}
        ${['1']}       | ${VoiceQueueTargetScope.Specific}
    `(
        'should set target_scope to $expectedTargetScope when linked_targets is $linked_targets',
        ({ linked_targets, expectedTargetScope }) => {
            watchMock.mockReturnValue([linked_targets, 5, 5] as any)
            renderComponent()

            expect(setValueMock).toHaveBeenCalledWith(
                'target_scope',
                expectedTargetScope,
            )
        },
    )

    it.each`
        ring_time | wait_time | expectedAgents
        ${5}      | ${12}     | ${'3 agents'}
        ${3}      | ${9}      | ${'3 agents'}
        ${4}      | ${19}     | ${'5 agents'}
    `(
        'should display maximum number of agents as $expectedAgents when ring_time is $ring_time and wait_time is $wait_time',
        ({ ring_time, wait_time, expectedAgents }) => {
            watchMock.mockReturnValue([[], ring_time, wait_time] as any)
            renderComponent()

            expect(screen.getByText(expectedAgents)).toBeInTheDocument()
        },
    )

    it('should display caller experience section', () => {
        renderComponent()

        expect(screen.getByText('Caller experience')).toBeInTheDocument()
        expect(
            screen.getByText("Customize your callers' waiting experience"),
        ).toBeInTheDocument()
    })

    describe('Linked targets field', () => {
        it('should transform output correctly', () => {
            renderComponent()

            const linkedTargetsField = getFormFieldCallByName('linked_targets')
            expect(linkedTargetsField?.[0]?.outputTransform?.(null)).toEqual([])
            expect(linkedTargetsField?.[0]?.outputTransform?.(1)).toEqual([
                { team_id: 1, user_id: null },
            ])
        })
    })

    describe('Ring time field', () => {
        it('should transform output correctly', () => {
            renderComponent()

            const ringTimeField = getFormFieldCallByName('ring_time')
            expect(ringTimeField?.[0]?.outputTransform?.('5')).toBe(5)

            expect(ringTimeField?.[0]?.outputTransform?.('')).toBe('')
        })
    })
})

const getFormFieldCallByName = (name: string) =>
    formFieldSpy.mock.calls.find((call) => call[0].name === name)
