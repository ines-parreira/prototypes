import { ComponentProps } from 'react'

import cn from 'classnames'

import { MacroAction } from '@gorgias/helpdesk-types'

import { TicketMessageSourceType } from 'business/types/ticket'
import TicketRichField from 'pages/common/forms/RichField/TicketRichField'
import { RecipientsLabel } from 'pages/common/utils/labels'
import { isRichType } from 'tickets/common/utils'
import { sanitizeHtmlForFacebookMessenger } from 'utils/html'

import css from './Preview.less'

export const ResponseTextPreview = ({
    responseTextAction,
    displayHTML,
    ticketMessageSourceType,
    isMacroResponseCcBccEnabled,
}: {
    responseTextAction?: MacroAction
    displayHTML?: boolean
    ticketMessageSourceType?: TicketMessageSourceType
    isMacroResponseCcBccEnabled: boolean
}) => {
    if (!responseTextAction) return null

    const { body_html, body_text, cc, bcc } = responseTextAction.arguments as {
        body_html?: string
        body_text?: string
        cc?: string
        bcc?: string
    }

    const value: ComponentProps<typeof TicketRichField>['value'] = {
        text: body_text,
    }

    const hasSourceType = !!ticketMessageSourceType

    // If displayHTML is set to TRUE or
    // ticketMessageSourceTypeisRichType property is passed to the element and supports HTML content
    // then we don't strip the HTML tags, we use it as it is.
    // This is used for macro preview.
    if (
        displayHTML ||
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        (hasSourceType && isRichType(ticketMessageSourceType!))
    ) {
        value.html = body_html
        // This is used for ticket macros
    } else if (
        hasSourceType &&
        ticketMessageSourceType === TicketMessageSourceType.FacebookMessenger
    ) {
        // Get body_html as text
        let html = body_html

        html = sanitizeHtmlForFacebookMessenger(html ?? '')
        value.html = html
    }

    return (
        <>
            {isMacroResponseCcBccEnabled && (
                <>
                    {cc && (
                        <div
                            className={cn(css.macroData, css.recipientsWrapper)}
                        >
                            <strong className="text-muted mr-2">
                                Add as CC:
                            </strong>
                            <RecipientsLabel recipients={cc} />
                        </div>
                    )}
                    {bcc && (
                        <div
                            className={cn(css.macroData, css.recipientsWrapper)}
                        >
                            <strong className="text-muted mr-2">
                                Add as BCC:
                            </strong>
                            <RecipientsLabel recipients={bcc} />
                        </div>
                    )}
                </>
            )}

            <div className={css.macroData}>
                <TicketRichField
                    value={value}
                    onChange={() => null}
                    displayOnly
                />
            </div>
        </>
    )
}
