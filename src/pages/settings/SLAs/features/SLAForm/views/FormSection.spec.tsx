import {render, screen} from '@testing-library/react'
import React from 'react'

import FormSection from './FormSection'

describe('<FormSection />', () => {
    it('should render child fields', () => {
        render(
            <FormSection>
                <div>form field 1</div>
                <div>form field 2</div>
            </FormSection>
        )

        expect(screen.getByText('form field 1')).toBeInTheDocument()
        expect(screen.getByText('form field 2')).toBeInTheDocument()
    })

    it('should render with title', () => {
        render(
            <FormSection title="Form Section Title">
                <div>form field</div>
            </FormSection>
        )

        expect(screen.getByText('Form Section Title')).toBeInTheDocument()
        expect(screen.getByText('form field')).toBeInTheDocument()
    })

    it('should render with title and description', () => {
        render(
            <FormSection
                title="Form Section Title"
                description="And then some more context"
            >
                <div>form field</div>
            </FormSection>
        )

        expect(screen.getByText('Form Section Title')).toBeInTheDocument()
        expect(screen.getByText('form field')).toBeInTheDocument()
    })

    it('should render with title and icon (md)', () => {
        render(
            <FormSection title="Form Section Title" icon="check">
                <div>form field</div>
            </FormSection>
        )

        expect(screen.getByText('check')).toBeInTheDocument()
        expect(screen.getByText('Form Section Title')).toBeInTheDocument()
        expect(screen.getByText('form field')).toBeInTheDocument()
    })

    it('should render with title and icon (element)', () => {
        render(
            <FormSection title="Form Section Title" icon={<div>the icon</div>}>
                <div>form field</div>
            </FormSection>
        )

        expect(screen.getByText('the icon')).toBeInTheDocument()
        expect(screen.getByText('Form Section Title')).toBeInTheDocument()
        expect(screen.getByText('form field')).toBeInTheDocument()
    })
})
