import { Button, Heading, Icon, Text } from '@gorgias/axiom'

import css from './PlaygroundInitialContent.less'

type PlaygroundInitialContentProps = {
    onStartClick?: () => void
    isLoading?: boolean
}

export const PlaygroundInitialContent = ({
    onStartClick,
    isLoading,
}: PlaygroundInitialContentProps) => {
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
                    send messages or take any real actions.
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
