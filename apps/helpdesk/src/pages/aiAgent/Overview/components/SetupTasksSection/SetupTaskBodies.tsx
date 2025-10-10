import cn from 'classnames'
import { useHistory } from 'react-router-dom'

import { LegacyButton as Button, Text } from '@gorgias/axiom'

import NewToggleField from 'pages/common/forms/NewToggleField'

import css from './SetupTaskBodies.less'

interface SetupTaskBodyProps {
    featureUrl?: string
    isCompleted?: boolean
}

interface TaskBodyWithButtonConfig {
    description: string
    buttonLabel: string
}

const TaskBodyWithButton = ({
    featureUrl,
    isCompleted,
    description,
    buttonLabel,
}: SetupTaskBodyProps & TaskBodyWithButtonConfig) => {
    const history = useHistory()

    const handleClick = () => {
        if (featureUrl) {
            history.push(featureUrl)
        }
    }

    return (
        <div
            className={cn(css.setupTaskBodies, {
                [css.completed]: isCompleted,
            })}
        >
            <div className={css.setupTaskDescription}>
                <Text size="sm">{description}</Text>
            </div>
            <Button size="small" onClick={handleClick} isDisabled={isCompleted}>
                {buttonLabel}
            </Button>
        </div>
    )
}

interface TaskBodyWithToggleConfig {
    description: string
    value: boolean
    onChange: () => void
}

const TaskBodyWithToggle = ({
    isCompleted,
    description,
    value,
    onChange,
}: SetupTaskBodyProps & TaskBodyWithToggleConfig) => {
    return (
        <div
            className={cn(css.setupTaskBodies, {
                [css.completed]: isCompleted,
            })}
        >
            <div className={css.setupTaskDescription}>
                <Text size="sm">{description}</Text>
            </div>
            <NewToggleField
                value={value}
                onChange={onChange}
                className={css.toggleButton}
                isDisabled={isCompleted}
            />
        </div>
    )
}

export const VerifyEmailDomainBody = (props: SetupTaskBodyProps) => {
    return (
        <TaskBodyWithButton
            {...props}
            description="Ensure customers receive emails from the AI Agent by verifying your domain."
            buttonLabel="Verify"
        />
    )
}

export const UpdateShopifyPermissionsBody = (props: SetupTaskBodyProps) => {
    return (
        <TaskBodyWithButton
            {...props}
            description="Update Shopify permissions to give AI Agent to information about your customers, orders and products."
            buttonLabel="Update"
        />
    )
}

export const CreateAnActionBody = (props: SetupTaskBodyProps) => {
    return (
        <TaskBodyWithButton
            {...props}
            description="Allow AI Agent to perform support tasks with your third-party apps, such as canceling orders, editing shipping addresses, and more."
            buttonLabel="Create"
        />
    )
}

export const MonitorAiAgentBody = (props: SetupTaskBodyProps) => {
    return (
        <TaskBodyWithButton
            {...props}
            description="Give feedback on AI Agent interactions to improve its accuracy and response quality for future customer requests."
            buttonLabel="Review"
        />
    )
}

export const EnableTriggerOnSearchBody = (props: SetupTaskBodyProps) => {
    const handleToggle = () => {
        // TODO: Implement toggle logic for trigger on search
    }

    return (
        <TaskBodyWithToggle
            {...props}
            description="Guide shoppers to right products by having AI Agent start a conversation after they use search."
            value={false}
            onChange={handleToggle}
        />
    )
}

export const EnableSuggestedProductsBody = (props: SetupTaskBodyProps) => {
    const handleToggle = () => {
        // TODO: Implement toggle logic for suggested products
    }

    return (
        <TaskBodyWithToggle
            {...props}
            description="Show dynamic, AI-generated questions on product pages to address common shopper questions. Brands that enable this feature see a significant lift in conversions."
            value={false}
            onChange={handleToggle}
        />
    )
}

export const EnableAskAnythingBody = (props: SetupTaskBodyProps) => {
    const handleToggle = () => {
        // TODO: Implement toggle logic for ask anything
    }

    return (
        <TaskBodyWithToggle
            {...props}
            description="Transform your chat bubble into a persistent input bar that invites shoppers to ask questions anytime. Encourage engagement by keeping support top-of-mind while shoppers browse."
            value={false}
            onChange={handleToggle}
        />
    )
}

export const EnableAIAgentOnChatBody = (props: SetupTaskBodyProps) => {
    const handleToggle = () => {
        // TODO: Implement toggle logic for AI agent on chat
    }

    return (
        <TaskBodyWithToggle
            {...props}
            description="Start automating conversations on email to save time and provide faster, more personalized responses to your customers."
            value={false}
            onChange={handleToggle}
        />
    )
}

export const EnableAIAgentOnEmailBody = (props: SetupTaskBodyProps) => {
    const handleToggle = () => {
        // TODO: Implement toggle logic for AI agent on email
    }

    return (
        <TaskBodyWithToggle
            {...props}
            description="Start automating conversations on chat to save time and provide faster, more personalized responses to your customers."
            value={false}
            onChange={handleToggle}
        />
    )
}
