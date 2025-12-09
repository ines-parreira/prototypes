import { useMemo } from 'react'

import { Button, Heading, Icon, Text } from '@gorgias/axiom'

import { useCoreContext } from 'pages/aiAgent/PlaygroundV2/contexts/CoreContext'

import css from './PlaygroundInitialContent.less'

type PlaygroundInitialContentProps = {
    onStartClick?: () => void
    isLoading?: boolean
}

export const PlaygroundInitialContent = ({
    onStartClick,
    isLoading,
}: PlaygroundInitialContentProps) => {
    const { areActionsEnabled } = useCoreContext()

    const actionsSnippet = useMemo(
        () =>
            areActionsEnabled
                ? ', but the actions will affect real customer data'
                : ' or take any real actions',
        [areActionsEnabled],
    )

    return (
        <div className={css.container}>
            <div className={css.icon}>
                <Icon name="ai-alt-1" size="md" />
            </div>
            <div className={css.content}>
                <Heading className={css.title} size="sm">
                    Preview shopper experience
                </Heading>
                <Text as="p" align="center" className={css.text}>
                    AI Agent will use your stores&apos; resources and order
                    history to respond. <br /> Preview conversations won&apos;t
                    send messages{actionsSnippet}.
                </Text>
            </div>
            {onStartClick && (
                <div className={css.actions}>
                    <Button
                        variant="primary"
                        onClick={onStartClick}
                        isLoading={isLoading}
                    >
                        Start Conversation
                    </Button>
                </div>
            )}
        </div>
    )
}
