import * as React from 'react'

import type {ActionName} from '../../draftjs/plugins/toolbar/types'
import type {PluginMethods} from '../../draftjs/plugins/types'
import Toolbar from '../../draftjs/plugins/toolbar/Toolbar'
import {AddImage, AddLink} from '../../draftjs/plugins/toolbar/components'

type Props = {
    attachFiles: (T: Array<Blob>) => void,
    canDropFiles: boolean,
    displayedActions: ?ActionName[],
    buttons?: React.Node[],
    attachments?: File[],
    linkEntityKey?: string,
    linkIsOpen: boolean,
    linkUrl: string,
    linkText: string,
    onLinkUrlChange: string => void,
    onLinkTextChange: string => void,
    onLinkOpen: () => void,
    onLinkClose: () => void,
    pluginMethods?: PluginMethods
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
            linkAction={(
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
            )}
            imageAction={(
                <AddImage
                    attachments={props.attachments}
                    {...pluginMethods}
                />
            )}
            {...pluginMethods}
        />
    )
}
