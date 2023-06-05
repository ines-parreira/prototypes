import {cleanup, fireEvent, render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import React from 'react'
import userEvent from '@testing-library/user-event'
import {mockStore} from 'utils/testing'
import {WhatsAppTemplate} from 'models/integration/types'
import WhatsAppTemplateNavigator from '../WhatsAppTemplateNavigator'

const mockTemplates = [
    {
        components: {
            header: {
                type: 'text',
                value: 'LOGIN ATTEMPT',
            },
            body: {
                type: 'text',
                value: "Hey {{1}},\\nHere's your https://www.google.com one-time password:  *{{2}}*\\nCode expires in 30 minutes.",
            },
            footer: {
                type: 'text',
                value: 'If you never requested this code, please ignore the message.',
            },
            button: {
                type: 'url',
                value: 'https://app.mobile.me.app/{{1}}',
            },
        },
        category: 'MARKETING',
        id: '1',
        external_id: '1',
        language: 'ca',
        name: 'first_template',
        status: 'REJECTED',
        waba_id: '123128413183132',
    } as any,
    {
        components: {
            header: {
                type: 'text',
                value: 'LOGIN ATTEMPT',
            },
            body: {
                type: 'text',
                value: "Here's the second template content",
            },
            footer: {
                type: 'text',
                value: 'If you never requested this code, please ignore the message.',
            },
            button: {
                type: 'url',
                value: 'https://app.mobile.me.app/{{1}}',
            },
        },
        category: 'MARKETING',
        id: '2',
        external_id: '2',
        language: 'ca',
        name: 'second_template',
        status: 'REJECTED',
        waba_id: '123128413183132',
    } as any,
] as WhatsAppTemplate[]

describe('WhatsAppTemplateNavigator', () => {
    const onItemClick = jest.fn()

    const renderComponent = () =>
        render(
            <Provider store={mockStore({} as any)}>
                <WhatsAppTemplateNavigator
                    templates={mockTemplates}
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
        userEvent.hover(screen.getByText('second_template'))
        expect(
            screen.getByText('second template content', {exact: false})
        ).toBeVisible()
    })

    it('should trigger onClick when clicking on a template', () => {
        renderComponent()
        fireEvent.click(screen.getByText('second_template'))
        expect(onItemClick).toHaveBeenCalledWith(mockTemplates[1])
    })
})
