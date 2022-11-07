import {Map} from 'immutable'
import {useMemo} from 'react'

import {
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_POSITION_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from 'config/integrations/gorgias_chat'

export function useChatPreviewProps(integration: Map<any, any>) {
    const position = useMemo(
        () => ({
            alignment: integration.getIn(
                ['decoration', 'position', 'alignment'],
                GORGIAS_CHAT_WIDGET_POSITION_DEFAULT.alignment
            ),
            offsetX: integration.getIn(
                ['decoration', 'position', 'offsetX'],
                GORGIAS_CHAT_WIDGET_POSITION_DEFAULT.offsetX
            ),
            offsetY: integration.getIn(
                ['decoration', 'position', 'offsetY'],
                GORGIAS_CHAT_WIDGET_POSITION_DEFAULT.offsetY
            ),
        }),
        [integration]
    )
    const mainColor: string | undefined =
        integration.getIn(['decoration', 'main_color']) ?? undefined

    const translatedTexts = useMemo<Record<string, string>>(() => {
        return GORGIAS_CHAT_WIDGET_TEXTS[
            (integration.getIn(['meta', 'language']) as string) ||
                GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT
        ]
    }, [integration])

    const output = useMemo(
        () => ({
            position,
            mainColor,
            translatedTexts,
        }),
        [position, mainColor, translatedTexts]
    )

    return output
}
