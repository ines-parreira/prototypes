import Button from 'pages/common/components/button/Button'

import { PlaygroundChannels } from '../PlaygroundChat/PlaygroundChat.types'

import css from './PlaygroundSegmentControl.less'

type Props = {
    selectedChannel: PlaygroundChannels
    onChannelChange: (channel: PlaygroundChannels) => void
    isDisabled?: boolean
}

const SegmentButton = ({
    onClick,
    label,
    isActive,
    isDisabled,
}: {
    isActive: boolean
    onClick: () => void
    label: string
    isDisabled?: boolean
}) => {
    return (
        <Button
            intent="secondary"
            size="small"
            role="tab"
            aria-selected={isActive ? 'true' : 'false'}
            fillStyle={isActive ? 'fill' : 'ghost'}
            onClick={onClick}
            isDisabled={isDisabled}
        >
            {label}
        </Button>
    )
}

export const PlaygroundSegmentControl = ({
    selectedChannel,
    onChannelChange,
    isDisabled,
}: Props) => {
    return (
        <div className={css.container}>
            <SegmentButton
                isActive={selectedChannel === 'email'}
                label="Email"
                onClick={() => onChannelChange('email')}
                isDisabled={isDisabled}
            />
            <SegmentButton
                isActive={selectedChannel === 'chat'}
                label="Chat"
                onClick={() => onChannelChange('chat')}
                isDisabled={isDisabled}
            />
        </div>
    )
}
