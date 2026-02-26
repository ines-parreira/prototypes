import type {
    HTMLAttributes,
    MouseEvent as ReactMouseEvent,
    ReactNode,
} from 'react'

import { useTheme } from '@emotion/react'
import styled from '@emotion/styled'

import { gorgiasColors } from 'gorgias-design-system/styles'
import type { ChatTheme } from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationPreview'

export interface ArticleAttachmentProps extends HTMLAttributes<HTMLElement> {
    /**
     * Article title
     */
    title: string
    /**
     * Article description
     */
    description?: string
    /**
     * The icon to display on the left side of the field.
     */
    leadIcon?: ReactNode
    /**
     * Function to be triggered when the article attachment is clicked.
     */
    onClick?: (event: ReactMouseEvent<HTMLElement, MouseEvent>) => void
}

const StyledArticleAttachment = styled.div`
    display: flex;
    align-items: flex-start;
    padding: 16px;
    gap: 4px;
    border-radius: 8px;
    border: 1px solid ${gorgiasColors.neutralGrey2};
    background-color: ${gorgiasColors.white};
    cursor: pointer;

    &:hover {
        box-shadow: 1px 1px 8px rgba(22, 22, 22, 0.05);
    }
`

const StyledArticleAttachmentInfo = styled.div`
    display: flex;
    flex-direction: column;
    overflow: hidden;
`

const StyledTitle = styled.span`
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
    letter-spacing: -0.14px;
    color: ${gorgiasColors.neutralGrey6};

    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
`

const StyledDescription = styled.span`
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    letter-spacing: -0.14px;
    color: ${gorgiasColors.neutralGrey5};
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
`

const StyledLeadIcon = styled.div<{ theme: ChatTheme }>`
    width: 24px;
    height: 24px;
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;

    svg {
        width: 18px;
        height: 18px;

        .withFill {
            fill: ${({ theme }) => theme?.mainColor};
        }
    }
`

/**
 * Media article attached in messages or chat campaigns. Articles are sent as message attachments in automated messages (article recommendation) and can be clicked to open the article within chat.
 */
export const ArticleAttachment = ({
    title,
    description,
    leadIcon,
    onClick,
    ...props
}: ArticleAttachmentProps) => {
    const theme = useTheme()
    return (
        <StyledArticleAttachment {...props} onClick={onClick}>
            {leadIcon && (
                // TODO(React18): Remove this once we upgrade to React 18
                <StyledLeadIcon theme={theme as unknown as ChatTheme}>
                    {leadIcon}
                </StyledLeadIcon>
            )}
            <StyledArticleAttachmentInfo>
                <StyledTitle>{title}</StyledTitle>
                {description && (
                    <StyledDescription>{description}</StyledDescription>
                )}
            </StyledArticleAttachmentInfo>
        </StyledArticleAttachment>
    )
}

export default ArticleAttachment
