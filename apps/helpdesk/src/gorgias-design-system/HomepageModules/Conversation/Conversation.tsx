import type { HTMLAttributes } from 'react'
import type React from 'react'

import { useTheme } from '@emotion/react'
import styled from '@emotion/styled'

import { gorgiasColors } from 'gorgias-design-system/styles'
import type { ChatTheme } from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationPreview'

const StyledIcon = styled.div`
    margin-left: auto;
`

const StyledContentPlaceholder = styled.div`
    flex: 1;
`

const StyledContent = styled.div<{ variant: ConversationVariant }>`
    ${({ variant }) => variant === 'collapsed' && 'padding: 12px 16px;'}

    overflow-y: auto;
    overflow-x: hidden;
    overscroll-behavior: contain;

    flex: 1;
    display: flex;
    flex-direction: column;
`

const StyledDescription = styled.div`
    color: ${gorgiasColors.neutralGrey5};

    font-size: 12px;
    font-weight: 400;
    letter-spacing: -0.14px;
    line-height: 16px;
`

const StyledTitle = styled.div`
    color: ${gorgiasColors.neutralGrey6};

    font-size: 14px;
    font-weight: 600;
    letter-spacing: -0.14px;
`

const StyledSubject = styled.div`
    display: flex;
    flex-direction: column;
`

const StyledConversationFooter = styled.div`
    padding: 0 0 20px;
`

const StyledConversationHeader = styled.div<{
    variant: ConversationVariant
    showBorder: boolean
    theme: ChatTheme
}>`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;

    svg .withFill {
        fill: ${({ theme }) => theme?.mainColor};
    }

    ${({ variant, showBorder }) => `
        ${variant === 'collapsed' ? 'cursor: pointer;' : ''}
        ${
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            showBorder &&
            `border-bottom: 1px solid ${gorgiasColors.neutralGrey2};`
        }
    `}
`

const StyledConversationContainer = styled.div<{
    variant: ConversationVariant
    isConversationView?: boolean
}>`
    border-radius: 8px;
    ${({ variant }) => (variant === 'collapsed' ? 'width: 100%;' : 'flex: 1;')}

    background: ${gorgiasColors.neutralGrey0};
    box-shadow: 1px 1px 8px 0px rgba(22, 22, 22, 0.05);

    overflow: hidden;
    display: flex;
    flex-direction: column;

    ${({ isConversationView }) =>
        isConversationView
            ? 'border-bottom-left-radius:0; border-bottom-right-radius: 0;'
            : ''}
`

type ConversationVariant = 'collapsed' | 'expanded'

type ConversationProps = {
    /**
     * The avatar or avatar group to display on the left side of the conversation header.
     */
    avatar?: React.ReactNode

    /**
     * The footer of the conversation that appears below the messages.
     */
    footer?: React.ReactNode

    /**
     * Whether to display the conversation header.
     */
    showHeader?: boolean

    /**
     * The title of the conversation that appears next to the avatar group, inside the conversation header.
     */
    title?: string

    /**
     * The description of the conversation that appears below the title, inside the conversation header.
     */
    description?: string

    /**
     * The icon to display on the right side of the conversation header.
     */
    trailIcon?: React.ReactNode

    /**
     * The variant of the conversation header which affects padding.
     */
    variant: ConversationVariant

    /**
     * The ref of the content container.
     */
    contentRef?: React.Ref<HTMLDivElement>

    /**
     * Whether the component is placed in a full-screen conversation view.
     */
    isConversationView?: boolean
}

const Conversation: React.FC<
    ConversationProps & HTMLAttributes<HTMLDivElement>
> = ({
    avatar,
    footer,
    showHeader = true,
    title,
    description,
    trailIcon,
    variant,
    children,
    onClick,
    contentRef,
    isConversationView,
    ...props
}) => {
    const theme = useTheme()
    return (
        <StyledConversationContainer
            variant={variant}
            isConversationView={isConversationView}
            {...props}
        >
            {showHeader && (
                <StyledConversationHeader
                    variant={variant}
                    showBorder={!!children || !!footer}
                    onClick={onClick}
                    // TODO(React18): Remove this once we upgrade to React 18
                    theme={theme as unknown as ChatTheme}
                >
                    {avatar ? avatar : undefined}
                    <StyledSubject>
                        {title && <StyledTitle>{title}</StyledTitle>}
                        {description && (
                            <StyledDescription>{description}</StyledDescription>
                        )}
                    </StyledSubject>
                    {trailIcon && <StyledIcon>{trailIcon}</StyledIcon>}
                </StyledConversationHeader>
            )}
            {children ? (
                <StyledContent variant={variant} ref={contentRef}>
                    {children}
                </StyledContent>
            ) : (
                variant === 'expanded' && <StyledContentPlaceholder />
            )}
            {footer && (
                <StyledConversationFooter>{footer}</StyledConversationFooter>
            )}
        </StyledConversationContainer>
    )
}

export default Conversation
