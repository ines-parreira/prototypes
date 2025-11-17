import type { ComponentProps } from 'react'
import React from 'react'

import {
    cleanup,
    fireEvent,
    render,
    screen,
    within,
} from '@testing-library/react'
import { Provider } from 'react-redux'

import { whatsAppMessageTemplates } from 'fixtures/whatsAppMessageTemplates'
import { mockStore } from 'utils/testing'

import WhatsAppMessageTemplateBody from '../WhatsAppMessageTemplateBody'

describe('WhatsAppMessageTemplateBody', () => {
    const onInputChange = jest.fn()

    const renderComponent = (
        props: Partial<ComponentProps<typeof WhatsAppMessageTemplateBody>> = {},
    ) =>
        render(
            <Provider store={mockStore({} as any)}>
                <WhatsAppMessageTemplateBody
                    isPreview={true}
                    template={whatsAppMessageTemplates[0]}
                    onChange={onInputChange}
                    {...props}
                />
            </Provider>,
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
