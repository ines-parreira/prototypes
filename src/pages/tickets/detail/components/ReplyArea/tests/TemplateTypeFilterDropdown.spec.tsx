import {cleanup, render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import React, {ComponentProps} from 'react'
import {mockFlags} from 'jest-launchdarkly-mock'
import {fromJS} from 'immutable'
import {mockStore} from 'utils/testing'
import * as WhatsAppEditorContext from 'pages/integrations/integration/components/whatsapp/WhatsAppEditorContext'
import {FeatureFlagKey} from 'config/featureFlags'
import {TicketChannel} from 'business/types/ticket'
import TemplateTypeFilterDropdown, {
    TemplateTypeFilterOption,
} from '../TemplateTypeFilterDropdown'

const useWhatsAppEditorSpy = jest.spyOn(
    WhatsAppEditorContext,
    'useWhatsAppEditor'
)

mockFlags({
    [FeatureFlagKey.WhatsAppMessageTemplates]: true,
})

describe('TemplateTypeFilterDropdown', () => {
    const renderComponent = (
        props: ComponentProps<typeof TemplateTypeFilterDropdown>,
        channel: TicketChannel,
        isPublic: boolean
    ) =>
        render(
            <Provider
                store={mockStore({
                    newMessage: fromJS({
                        newMessage: {
                            channel,
                            public: isPublic,
                        },
                    }),
                } as any)}
            >
                <TemplateTypeFilterDropdown {...props} />
            </Provider>
        )

    afterEach(cleanup)

    it('should not render anything when channel is not WhatsApp', () => {
        renderComponent(
            {value: TemplateTypeFilterOption.Macros},
            TicketChannel.InternalNote,
            true
        )
        expect(screen.queryByText('Macros')).toBeNull()
    })

    it('should not render anything when channel is WhatsApp but new message is not public', () => {
        renderComponent(
            {value: TemplateTypeFilterOption.Macros},
            TicketChannel.InternalNote,
            false
        )
        expect(screen.queryByText('Macros')).toBeNull()
    })

    it('should render dropdown with Macros and Templates options when channel is WhatsApp', () => {
        renderComponent(
            {value: TemplateTypeFilterOption.Macros},
            TicketChannel.WhatsApp,
            true
        )
        expect(screen.getAllByText('Macros')).toHaveLength(2)
        expect(screen.getByText('Templates')).toBeInTheDocument()
    })

    it('should switch to Templates when Templates option is clicked', () => {
        const mockSetSelectedTemplateType = jest.fn()
        useWhatsAppEditorSpy.mockReturnValue({
            setSelectedTemplateType: mockSetSelectedTemplateType,
        } as any)
        renderComponent(
            {value: TemplateTypeFilterOption.Macros},
            TicketChannel.WhatsApp,
            true
        )
        screen.getByText('Templates').click()
        expect(mockSetSelectedTemplateType).toHaveBeenCalledWith(
            TemplateTypeFilterOption.Templates
        )
    })

    it('should switch to Macros when Macros option is clicked', () => {
        const mockSetSelectedTemplateType = jest.fn()
        useWhatsAppEditorSpy.mockReturnValue({
            setSelectedTemplateType: mockSetSelectedTemplateType,
        } as any)
        renderComponent(
            {value: TemplateTypeFilterOption.Templates},
            TicketChannel.WhatsApp,
            true
        )
        screen.getByText('Macros').click()
        expect(mockSetSelectedTemplateType).toHaveBeenCalledWith(
            TemplateTypeFilterOption.Macros
        )
    })
})
