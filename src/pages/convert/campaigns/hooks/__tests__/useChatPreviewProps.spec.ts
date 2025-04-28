import { fromJS } from 'immutable'

import {
    GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT,
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_POSITION_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from 'config/integrations/gorgias_chat'
import { Language } from 'constants/languages'
import { useChatPreviewProps } from 'pages/convert/campaigns/hooks/useChatPreviewProps'
import { renderHook } from 'utils/testing/renderHook'

describe('useChatPreviewProps()', () => {
    describe('integration is empty', () => {
        const integration = fromJS({})

        it('returns the default position and translated texts', () => {
            const { result } = renderHook(() =>
                useChatPreviewProps(integration),
            )

            expect(result.current).toEqual({
                position: GORGIAS_CHAT_WIDGET_POSITION_DEFAULT,
                translatedTexts:
                    GORGIAS_CHAT_WIDGET_TEXTS[
                        GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT
                    ],
                mainFontFamily: GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT,
            })
        })
    })

    describe('integration has chat data', () => {
        const integration = fromJS({
            decoration: {
                main_color: '#000',
                main_font_family: 'Impact',
            },
            meta: {
                language: Language.Spanish,
            },
        })

        it('returns the chat position, color and translated texts', () => {
            const { result } = renderHook(() =>
                useChatPreviewProps(integration),
            )

            expect(result.current).toEqual({
                position: GORGIAS_CHAT_WIDGET_POSITION_DEFAULT,
                mainColor: '#000',
                translatedTexts: GORGIAS_CHAT_WIDGET_TEXTS[Language.Spanish],
                mainFontFamily: 'Impact',
            })
        })
    })
})
