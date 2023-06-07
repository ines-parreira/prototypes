import React from 'react'
import {render} from '@testing-library/react'

import BotMessages from '../BotMessages'
import {useChatIntegrationPreviewContext} from '../ChatIntegrationPreviewContext'

jest.mock('../ChatIntegrationPreviewContext')

describe('<BotMessages />', () => {
    const minProps: React.ComponentProps<typeof BotMessages> = {
        chatTitle: 'Acme Support',
        className: 'test-class',
        messages: ['Hello!', 'How can I help you?'],
    }

    it('should display bot icon', () => {
        ;(useChatIntegrationPreviewContext as jest.Mock).mockReturnValue({})

        const {
            container: {firstChild},
        } = render(
            <BotMessages {...minProps}>
                <div>test</div>
            </BotMessages>
        )

        expect(firstChild).toMatchSnapshot()
    })

    it('should display company logo', () => {
        ;(useChatIntegrationPreviewContext as jest.Mock).mockReturnValue({
            avatar: {
                companyLogoUrl: 'company-logo-url.jpg',
            },
        })

        const {
            container: {firstChild},
        } = render(
            <BotMessages {...minProps}>
                <div>test</div>
            </BotMessages>
        )

        expect(firstChild).toMatchSnapshot()
    })
})
