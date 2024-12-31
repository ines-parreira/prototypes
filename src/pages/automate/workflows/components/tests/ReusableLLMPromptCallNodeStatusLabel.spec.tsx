import {render, screen} from '@testing-library/react'
import React from 'react'

import ReusableLLMPromptCallNodeStatusLabel from '../ReusableLLMPromptCallNodeStatusLabel'

describe('ReusableLLMPromptCallNodeStatusLabel', () => {
    it('shows both authentication and values required message', () => {
        render(
            <ReusableLLMPromptCallNodeStatusLabel
                hasMissingCredentials={true}
                hasMissingValues={true}
            />
        )
        expect(
            screen.getByText('Authentication and values required')
        ).toBeInTheDocument()
    })

    it('shows authentication required message', () => {
        render(
            <ReusableLLMPromptCallNodeStatusLabel
                hasMissingCredentials={true}
                hasMissingValues={false}
            />
        )
        expect(screen.getByText('Authentication required')).toBeInTheDocument()
    })

    it('shows values required message', () => {
        render(
            <ReusableLLMPromptCallNodeStatusLabel
                hasMissingCredentials={false}
                hasMissingValues={true}
            />
        )
        expect(screen.getByText('Values required')).toBeInTheDocument()
    })

    it('shows edit both message when both are present', () => {
        render(
            <ReusableLLMPromptCallNodeStatusLabel
                hasCredentials={true}
                hasAllValues={true}
            />
        )
        expect(
            screen.getByText('Edit authentication and values')
        ).toBeInTheDocument()
    })

    it('shows edit authentication message', () => {
        render(
            <ReusableLLMPromptCallNodeStatusLabel
                hasCredentials={true}
                hasAllValues={false}
            />
        )
        expect(screen.getByText('Edit authentication')).toBeInTheDocument()
    })

    it('shows edit values message', () => {
        render(
            <ReusableLLMPromptCallNodeStatusLabel
                hasCredentials={false}
                hasAllValues={true}
            />
        )
        expect(screen.getByText('Edit values')).toBeInTheDocument()
    })

    it('renders nothing when no props are provided', () => {
        const {container} = render(<ReusableLLMPromptCallNodeStatusLabel />)
        expect(container).toBeEmptyDOMElement()
    })
})
