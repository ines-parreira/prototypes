import {Tooltip} from '@gorgias/ui-kit'
import React, {useRef} from 'react'

import IconButton from 'pages/common/components/button/IconButton'
import history from 'pages/history'
import {ChannelIdentifier} from 'services/channels'

import css from './ReconnectButton.less'
import {getReconnectUrl} from './utils'

export default function ReconnectButton({
    channel,
}: {
    channel?: Maybe<ChannelIdentifier>
}) {
    const buttonRef = useRef<HTMLButtonElement>(null)

    return (
        <>
            <IconButton
                ref={buttonRef}
                onClick={() => history.push(getReconnectUrl(channel))}
                fillStyle="ghost"
                className={css.button}
            >
                cached
            </IconButton>
            <Tooltip
                placement="top"
                trigger={['hover']}
                target={buttonRef}
                boundariesElement={document.body}
                innerProps={{
                    positionFixed: true,
                }}
                delay={0}
            >
                Reconnect
            </Tooltip>
        </>
    )
}
