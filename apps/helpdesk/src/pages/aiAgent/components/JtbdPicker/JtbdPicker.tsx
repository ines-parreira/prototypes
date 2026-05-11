import type { ReactNode } from 'react'

import { Box, Card, CardHeader, Heading, Icon, Text } from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

import { AiAgentScopes } from 'pages/aiAgent/Onboarding_V2/types'
import type { JtbdValue } from 'pages/aiAgent/utils/jtbd'

type JtbdPickerProps = {
    onSelect: (jtbd: JtbdValue) => void
}

type OptionCardProps = {
    iconName: IconName
    title: string
    onSelect: () => void
}

const OptionCard = ({
    iconName,
    title,
    onSelect,
}: OptionCardProps): ReactNode => (
    <Card elevation="mid" onClick={onSelect} aria-label={title}>
        <Box gap="sm">
            <Icon name={iconName} color="content-neutral-default" size="md" />
            <CardHeader title={title} />
        </Box>
    </Card>
)

export const JtbdPicker = ({ onSelect }: JtbdPickerProps) => (
    <Box flexDirection="column" gap="lg">
        <Box flexDirection="column" gap="sm">
            <Heading size="lg">
                What do you want AI Agent to handle first?
            </Heading>
            <Text color="content-neutral-secondary">
                {`We'll prioritize this during setup. You can configure the
                rest anytime.`}
            </Text>
        </Box>

        <Box flexDirection="column" gap="sm">
            <OptionCard
                iconName="comm-chat-conversation-circle"
                title="Resolve support questions automatically"
                onSelect={() => onSelect(AiAgentScopes.SUPPORT)}
            />
            <OptionCard
                iconName="shopping-cart"
                title="Turn shopper conversations into sales"
                onSelect={() => onSelect(AiAgentScopes.SALES)}
            />
        </Box>
    </Box>
)
