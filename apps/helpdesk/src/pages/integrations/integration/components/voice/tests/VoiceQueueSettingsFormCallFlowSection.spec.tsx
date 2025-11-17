import { assumeMock } from '@repo/testing'
import type { RenderResult } from '@testing-library/react'
import { render, screen } from '@testing-library/react'

import { VoiceQueueTargetScope } from '@gorgias/helpdesk-queries'

import { FormField, useFormContext } from 'core/forms'
import * as forms from 'core/forms'

import VoiceQueueSettingsFormCallFlowSection from '../VoiceQueueSettingsFormCallFlowSection'

const formFieldSpy = jest.spyOn(forms, 'FormField')

jest.mock('core/forms')
const FormFieldMock = assumeMock(FormField)

jest.mock('models/team/queries', () => ({
    useListTeams: jest.fn(),
}))

const watchMock = jest.fn()
const setValueMock = jest.fn()
const unregisterMock = jest.fn()
const mockUseFormContextReturnValue = {
    watch: watchMock,
    setValue: setValueMock,
    unregister: unregisterMock,
} as unknown as ReturnType<typeof useFormContext>

jest.mock('react-hook-form')
const useFormContextMock = assumeMock(useFormContext)

describe('<VoiceQueueSettingsFormCallFlowSection />', () => {
    const renderComponent = (props: any = {}): RenderResult => {
        return render(<VoiceQueueSettingsFormCallFlowSection {...props} />)
    }

    beforeEach(() => {
        FormFieldMock.mockImplementation(({ label }: any) => <div>{label}</div>)
        watchMock.mockReturnValue([[], 5, 5, false] as any)
        useFormContextMock.mockReturnValue(mockUseFormContextReturnValue)
    })

    it('should display all fields', () => {
        watchMock.mockReturnValue([[], 5, 5, true] as any)
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
        expect(FormFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'wait_time',
            }),
            {},
        )
        expect(FormFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'wait_music',
            }),
            {},
        )
        expect(FormFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'is_wrap_up_time_enabled',
            }),
            {},
        )
        expect(FormFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'wrap_up_time',
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
            watchMock.mockReturnValue([linked_targets, 5, 5, false] as any)
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
            watchMock.mockReturnValue([[], ring_time, wait_time, false] as any)
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

    describe('Wait time field', () => {
        it('should transform output correctly', () => {
            renderComponent()

            const waitTimeField = getFormFieldCallByName('wait_time')
            expect(waitTimeField?.[0]?.outputTransform?.('12')).toBe(12)

            expect(waitTimeField?.[0]?.outputTransform?.('')).toBe('')
        })
    })

    describe('Wrap up time feature', () => {
        it('should not display wrap-up time field when is_wrap_up_time_enabled is false', () => {
            watchMock.mockReturnValue([[], 5, 5, false] as any)
            renderComponent()

            expect(FormFieldMock).not.toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'wrap_up_time',
                }),
            )
        })

        it('should display wrap-up time fields with correct properties', () => {
            watchMock.mockReturnValue([[], 5, 5, true] as any)
            renderComponent()

            const wrapUpTimeField = getFormFieldCallByName('wrap_up_time')
            expect(wrapUpTimeField).toBeDefined()
            expect(wrapUpTimeField?.[0]).toEqual(
                expect.objectContaining({
                    name: 'wrap_up_time',
                    label: 'Wrap-up time',
                    type: 'number',
                    caption:
                        'Set a time between 10 and 600 seconds (10 minutes).',
                }),
            )

            expect(wrapUpTimeField?.[0]?.outputTransform?.('')).toBe(null)
            expect(wrapUpTimeField?.[0]?.outputTransform?.('30')).toBe(30)
        })
    })
})

const getFormFieldCallByName = (name: string) =>
    formFieldSpy.mock.calls.find((call) => call[0].name === name)
