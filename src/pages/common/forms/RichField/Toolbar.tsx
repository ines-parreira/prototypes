import React, {ReactNode} from 'react'

import {ActionName} from '../../draftjs/plugins/toolbar/types'
import {PluginMethods} from '../../draftjs/plugins/types'
import Toolbar from '../../draftjs/plugins/toolbar/Toolbar'
import {AddImage, AddLink} from '../../draftjs/plugins/toolbar/components/index'

type Props = {
    attachFiles: (T: Array<Blob>) => void
    canDropFiles: boolean
    displayedActions?: ActionName[]
    buttons?: ReactNode[]
    attachments?: File[]
    linkEntityKey?: string
    linkIsOpen: boolean
    linkUrl: string
    linkText: string
    onLinkUrlChange: (url: string) => void
    onLinkTextChange: (text: string) => void
    onLinkOpen: () => void
    onLinkClose: () => void
    quickReply: ReactNode
    pluginMethods?: PluginMethods
    productCardsEnabled: boolean
}

export default function RichFieldToolbar(props: Props) {
    const {pluginMethods} = props

    if (!pluginMethods) {
        return null
    }

    return (
        <Toolbar
            attachFiles={props.attachFiles}
            canDropFiles={props.canDropFiles}
            displayedActions={props.displayedActions}
            buttons={props.buttons}
            linkAction={
                <AddLink
                    entityKey={props.linkEntityKey}
                    isOpen={props.linkIsOpen}
                    url={props.linkUrl}
                    text={props.linkText}
                    onUrlChange={props.onLinkUrlChange}
                    onTextChange={props.onLinkTextChange}
                    onOpen={props.onLinkOpen}
                    onClose={props.onLinkClose}
                    {...pluginMethods}
                />
            }
            imageAction={
                <AddImage attachments={props.attachments} {...pluginMethods} />
            }
            quickReply={props.quickReply}
            {...pluginMethods}
            productCardsEnabled={props.productCardsEnabled}
        />
    )
}
