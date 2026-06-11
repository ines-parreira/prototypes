import type { ComponentProps } from 'react'
import React from 'react'

import { render } from '@repo/testing'
import { cleanup, fireEvent, screen, within } from '@testing-library/react'

import { whatsAppMessageTemplates } from 'fixtures/whatsAppMessageTemplates'

import { WhatsAppMessageTemplateBody } from '../WhatsAppMessageTemplateBody'

describe('WhatsAppMessageTemplateBody', () => {
    const onInputChange = jest.fn()

    const renderComponent = (
        props: Partial<ComponentProps<typeof WhatsAppMessageTemplateBody>> = {},
    ) =>
        render(
            <WhatsAppMessageTemplateBody
                isPreview={true}
                template={whatsAppMessageTemplates[0]}
                onChange={onInputChange}
                {...props}
            />,
        )

    afterEach(cleanup)

    it('should render all variables as "WhatsApp Variable" when isPreview=true', () => {
        renderComponent()
        expect(screen.getAllByText('WhatsApp Variable')).toHaveLength(2)
    })

    it('should render all variables as inputs when isPreview=false', () => {
        renderComponent({ isPreview: false })
        expect(screen.getAllByTestId('wa-variable-input')).toHaveLength(2)
    })

    it('should call onInputChange when input value changes', () => {
        renderComponent({ isPreview: false })

        const input = within(
            screen.getAllByTestId('wa-variable-input')[1],
        ).getByRole('textbox')

        fireEvent.change(input, { target: { value: 'hiii' } })
        expect(onInputChange).toHaveBeenCalledWith([undefined, 'hiii'])
    })
})
