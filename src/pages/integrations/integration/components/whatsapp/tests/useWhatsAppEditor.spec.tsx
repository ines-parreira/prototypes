import {renderHook} from '@testing-library/react-hooks'
import {fromJS} from 'immutable'
import {mockFlags, resetLDMocks} from 'jest-launchdarkly-mock'
import React from 'react'
import {Provider} from 'react-redux'

import {TicketChannel} from 'business/types/ticket'
import {FeatureFlagKey} from 'config/featureFlags'
import {MacroAction} from 'models/macroAction/types'
import {TemplateTypeFilterOption} from 'pages/tickets/detail/components/ReplyArea/types'
import {mockStore} from 'utils/testing'

import useWhatsAppEditor from '../useWhatsAppEditor'
import * as whatsAppUtils from '../utils'
import WhatsAppEditorProvider from '../WhatsAppEditorProvider'

const isWhatsAppWindowOpenSpy = jest.spyOn(
    whatsAppUtils,
    'isWhatsAppWindowOpen'
)

const createStore = ({
    channel,
    actions,
    isPublic,
}: {
    channel: TicketChannel
    actions: MacroAction[] | null
    isPublic: boolean
}) =>
    mockStore({
        newMessage: fromJS({
            newMessage: {
                channel,
                actions,
                public: isPublic,
            },
        }),
        ticket: fromJS({
            id: '1',
            messages: [],
        }),
    } as any)

describe('useWhatsAppEditor', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        resetLDMocks()
    })

    const renderHookWithStore = (store: any) =>
        renderHook(useWhatsAppEditor, {
            wrapper: ({children}: any) => (
                <Provider store={createStore(store)}>
                    <WhatsAppEditorProvider>{children}</WhatsAppEditorProvider>
                </Provider>
            ),
        })

    it('WhatsApp template editor should be visible when flag is enabled, channel is WhatsApp, template search is selected and new message is public', () => {
        mockFlags({
            [FeatureFlagKey.WhatsAppMessageTemplates]: true,
        })
        const {result} = renderHookWithStore({
            channel: TicketChannel.WhatsApp,
            actions: null,
            isPublic: true,
        })
        expect(result.current.showWhatsAppTemplateEditor).toBe(true)
    })

    it('WhatsApp template editor should not be visible after selecting Macro search', () => {
        mockFlags({
            [FeatureFlagKey.WhatsAppMessageTemplates]: true,
        })
        const {result} = renderHookWithStore({
            channel: TicketChannel.WhatsApp,
            actions: null,
            isPublic: true,
        })
        expect(result.current.showWhatsAppTemplateEditor).toBe(true)

        result.current.setSelectedTemplateType(TemplateTypeFilterOption.Macros)
        expect(result.current.showWhatsAppTemplateEditor).toBe(false)
    })

    it('WhatsApp template editor should not be visible when flag is disabled', () => {
        mockFlags({
            [FeatureFlagKey.WhatsAppMessageTemplates]: false,
        })
        const {result} = renderHookWithStore({
            channel: TicketChannel.WhatsApp,
            actions: null,
            isPublic: true,
        })
        expect(result.current.showWhatsAppTemplateEditor).toBe(false)
    })

    it.each([
        TicketChannel.Email,
        TicketChannel.InternalNote,
        TicketChannel.Sms,
    ])(
        'WhatsApp template editor should not be visible when channel is not WhatsApp',
        (sourceType) => {
            mockFlags({
                [FeatureFlagKey.WhatsAppMessageTemplates]: true,
            })
            const {result} = renderHookWithStore({
                channel: sourceType,
                actions: null,
                isPublic: true,
            })
            expect(result.current.showWhatsAppTemplateEditor).toBe(false)
        }
    )

    it('should display Macro search by default when WhatsApp window is open', () => {
        mockFlags({
            [FeatureFlagKey.WhatsAppMessageTemplates]: true,
        })
        isWhatsAppWindowOpenSpy.mockReturnValue(true)
        const {result} = renderHookWithStore({
            channel: TicketChannel.WhatsApp,
            actions: null,
            isPublic: true,
        })
        expect(result.current.selectedTemplateType).toBe(
            TemplateTypeFilterOption.Macros
        )
    })
})
