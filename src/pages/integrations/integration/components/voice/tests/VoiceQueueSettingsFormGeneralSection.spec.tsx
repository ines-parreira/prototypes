import React from 'react'

import { render, screen } from '@testing-library/react'

import { Form } from 'core/forms'
import * as forms from 'core/forms'

import VoiceQueueSettingsFormGeneralSection from '../VoiceQueueSettingsFormGeneralSection'

const formFieldSpy = jest.spyOn(forms, 'FormField')

describe('VoiceQueueSettingsFormGeneralSection', () => {
    const renderComponent = () =>
        render(
            <Form onValidSubmit={jest.fn()}>
                <VoiceQueueSettingsFormGeneralSection />
            </Form>,
        )

    it('should render the general section content', () => {
        renderComponent()

        expect(screen.getByText('Queue name')).toBeInTheDocument()
        expect(screen.getByText('Queue capacity')).toBeInTheDocument()
        expect(screen.getByText('Priority queue')).toBeInTheDocument()
    })

    describe('Queue capacity field', () => {
        it('should transform output correctly', () => {
            renderComponent()

            const queueCapacityField = getFormFieldCallByName('capacity')

            expect(queueCapacityField?.[0]?.outputTransform?.('')).toBe(null)
            expect(queueCapacityField?.[0]?.outputTransform?.('100')).toBe(100)
        })
    })

    describe('Priority weight field', () => {
        it('should transform input correctly', () => {
            renderComponent()

            const priorityWeightField =
                getFormFieldCallByName('priority_weight')
            expect(priorityWeightField?.[0]?.inputTransform?.(100)).toBe(false)
            expect(priorityWeightField?.[0]?.inputTransform?.(1)).toBe(true)
        })

        it('should transform output correctly', () => {
            renderComponent()

            const priorityWeightField =
                getFormFieldCallByName('priority_weight')
            expect(priorityWeightField?.[0]?.outputTransform?.(true)).toBe(1)
            expect(priorityWeightField?.[0]?.outputTransform?.(false)).toBe(100)
        })
    })
})

const getFormFieldCallByName = (name: string) =>
    formFieldSpy.mock.calls.find((call) => call[0].name === name)
