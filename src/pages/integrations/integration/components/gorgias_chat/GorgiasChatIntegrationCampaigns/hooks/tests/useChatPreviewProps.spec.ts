import {fromJS} from 'immutable'
import {renderHook} from 'react-hooks-testing-library'

import {SPANISH_LANGUAGE} from 'constants/languages'

import {
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_POSITION_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from 'config/integrations/gorgias_chat'

import {useChatPreviewProps} from '../useChatPreviewProps'

describe('useChatPreviewProps()', () => {
    describe('integration is empty', () => {
        const integration = fromJS({})

        it('returns the default position and translated texts', () => {
            const {result} = renderHook(() => useChatPreviewProps(integration))

            expect(result.current).toEqual({
                position: GORGIAS_CHAT_WIDGET_POSITION_DEFAULT,
                translatedTexts:
                    GORGIAS_CHAT_WIDGET_TEXTS[
                        GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT
                    ],
            })
        })
    })

    describe('integration has chat data', () => {
        const integration = fromJS({
            decoration: {
                main_color: '#000',
            },
            meta: {
                language: SPANISH_LANGUAGE,
            },
        })

        it('returns the chat position, color and translated texts', () => {
            const {result} = renderHook(() => useChatPreviewProps(integration))

            expect(result.current).toEqual({
                position: GORGIAS_CHAT_WIDGET_POSITION_DEFAULT,
                mainColor: '#000',
                translatedTexts: GORGIAS_CHAT_WIDGET_TEXTS[SPANISH_LANGUAGE],
            })
        })
    })
})
