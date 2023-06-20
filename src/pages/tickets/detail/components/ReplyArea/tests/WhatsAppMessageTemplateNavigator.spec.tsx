import {cleanup, fireEvent, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import React from 'react'
import userEvent from '@testing-library/user-event'
import {mockStore, renderWithRQProvider} from 'utils/testing'
import {whatsAppMessageTemplates} from 'fixtures/whatsAppMessageTemplates'
import WhatsAppMessageTemplateNavigator from '../WhatsAppMessageTemplateNavigator'

describe('WhatsAppMessageTemplateNavigator', () => {
    const onItemClick = jest.fn()

    const renderComponent = () =>
        renderWithRQProvider(
            <Provider store={mockStore({} as any)}>
                <WhatsAppMessageTemplateNavigator
                    templates={whatsAppMessageTemplates}
                    onItemClick={onItemClick}
                />
            </Provider>
        )

    afterEach(cleanup)

    it('should display the preview of the first template by default', () => {
        renderComponent()
        expect(
            screen.getByText('one-time password', {exact: false})
        ).toBeVisible()
    })

    it('should display the preview of the hovered template', () => {
        renderComponent()
        userEvent.hover(screen.getByText('rejected_template_sample'))
        expect(
            screen.getByText('rejected template content', {exact: false})
        ).toBeVisible()
    })

    it('should trigger onClick when clicking on a template', () => {
        renderComponent()
        fireEvent.click(screen.getByText('rejected_template_sample'))
        expect(onItemClick).toHaveBeenCalledWith(whatsAppMessageTemplates[1])
    })
})
