import type { FC, HTMLAttributes, ReactNode } from 'react'

import { useTheme } from '@emotion/react'
import styled from '@emotion/styled'

import { gorgiasColors } from 'gorgias-design-system/styles'
import { setLightness } from 'gorgias-design-system/utils'
import type { ChatTheme } from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationPreview'

const StyledTrailIcon = styled.div`
    margin-left: auto;

    svg {
        height: 20px;
        width: 20px;
    }
`

const StyledLeadIcon = styled.div<{ theme: ChatTheme }>`
    border-radius: 4px;
    background: ${({ theme }) => setLightness(theme?.mainColor)};

    min-width: 44px;
    width: 44px;
    height: 44px;

    display: flex;
    justify-content: center;
    align-items: center;
    align-self: flex-start;
`

const StyledCardDescription = styled.span`
    color: ${gorgiasColors.neutralGrey5};

    font-size: 14px;
    font-weight: 400;
    letter-spacing: -0.14px;
`

const StyledCardTitle = styled.span`
    color: ${gorgiasColors.neutralGrey6};

    font-size: 14px;
    font-weight: 600;
    letter-spacing: -0.14px;
`

const StyledCardContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`

const StyledCardContainer = styled.div<{ theme: ChatTheme }>`
    width: 100%;
    cursor: pointer;

    background: ${gorgiasColors.neutralGrey0};

    padding: 16px;
    box-shadow: 1px 1px 8px 0px rgba(22, 22, 22, 0.05);
    border-radius: 8px;

    display: flex;
    align-items: center;
    gap: 12px;

    svg {
        .withFill {
            fill: ${({ theme }) => theme?.mainColor};
        }
    }
`

type CardProps = {
    /**
     * The title of the card, displayed in bold.
     */
    title: string

    /**
     * The description of the card, displayed below the title.
     */
    description?: string

    /**
     * The icon to display on the left side of the card.
     */
    leadIcon?: ReactNode
    /**
     * The icon to display on the right side of the card.
     */
    trailIcon?: ReactNode
}

/**
 * A card that is used to navigate to a different page inside the widget.
 */
const Card: FC<CardProps & HTMLAttributes<HTMLDivElement>> = ({
    title,
    description,
    leadIcon,
    trailIcon,
    ...props
}) => {
    const theme = useTheme()
    return (
        <StyledCardContainer
            role="link"
            // TODO(React18): Remove this once we upgrade to React 18
            theme={theme as unknown as ChatTheme}
            {...props}
        >
            {leadIcon && (
                // TODO(React18): Remove this once we upgrade to React 18
                <StyledLeadIcon theme={theme as unknown as ChatTheme}>
                    {leadIcon}
                </StyledLeadIcon>
            )}
            <StyledCardContent>
                <StyledCardTitle>{title}</StyledCardTitle>
                {description && (
                    <StyledCardDescription>{description}</StyledCardDescription>
                )}
            </StyledCardContent>
            {trailIcon && <StyledTrailIcon>{trailIcon}</StyledTrailIcon>}
        </StyledCardContainer>
    )
}
export default Card
