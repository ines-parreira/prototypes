import type { HTMLAttributes } from 'react'
import type React from 'react'

import { useTheme } from '@emotion/react'
import styled from '@emotion/styled'

import { gorgiasColors } from 'gorgias-design-system/styles'
import { setLightness } from 'gorgias-design-system/utils'
import type { ChatTheme } from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationPreview'

const StyledTrailContent = styled.div`
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 8px;
`

const StyledTrailIcon = styled.div<{ theme: ChatTheme }>`
    svg {
        height: 20px;
        width: 20px;

        .withFill {
            fill: ${({ theme }) => theme?.mainColor};
        }
    }
`

const StyledImage = styled.div<{ src: string; variant: ListItemVariant }>`
    align-self: flex-start;

    ${({ variant }) =>
        variant === 'condensed'
            ? 'width: 28px; height: 28px;'
            : 'width: 32px; height: 32px;'}

    background-image: url(${({ src }) => src});
    background-size: cover;
    background-position: center;
    background-color: ${gorgiasColors.neutralGrey6};

    border-radius: 2px;
`

const StyledLeadIcon = styled.div`
    align-self: flex-start;

    svg .withFill {
        fill: ${gorgiasColors.neutralGrey4};
    }
`

const StyledListItemDescription = styled.span`
    color: ${gorgiasColors.neutralGrey5};

    font-size: 14px;
    font-weight: 400;
    letter-spacing: -0.14px;
`

const StyledListItemLabel = styled.span`
    color: ${gorgiasColors.neutralGrey6};

    font-size: 14px;
    font-weight: 400;
    letter-spacing: -0.14px;
`

const StyledListItemContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`

const StyledListItemContainer = styled.div<{
    variant: ListItemVariant
    theme: ChatTheme
}>`
    width: 100%;
    cursor: pointer;

    background: ${gorgiasColors.neutralGrey0};

    padding: 8px;
    border-radius: 4px;

    display: flex;
    align-items: center;
    gap: 8px;

    &:hover,
    &.active {
        background: ${({ theme }) => setLightness(theme?.mainColor)};
    }
`

type ListItemVariant = 'default' | 'condensed'

type ListItemProps = {
    /**
     * The variant of the list item which affects image size and content alignment.
     * Should not be used in conjunction with the `description` property.
     */
    variant?: ListItemVariant

    /**
     * The label of the list item.
     */
    label: string

    /**
     * The description of the list item, displayed below the label.
     */
    description?: string

    /**
     * The position of the description relative to the label.
     */
    descriptionPosition?: 'bottom' | 'right'

    /**
     * The icon to display on the left side of the list item, before the image.
     * Recommended size is 20x20px.
     */
    leadIcon?: React.ReactNode
    /**
     * The source URL of the image to display on the left side of the list item, next to the leadIcon.
     * Should not be used in conjunction with the `leadIcon` property, as the image will only be displayed if there is no `leadIcon` specified.     *
     */
    src?: string
    /**
     * The alt text of the image.
     */
    alt?: string
    /**
     * The icon to display on the right side of the list item.
     */
    trailIcon?: React.ReactNode
}

/**
 * A clickable list item to perform an action, make a selection or navigate.
 * Should be placed inside a <List\/> component along with other <ListItem\/> components.
 */
const ListItem: React.FC<ListItemProps & HTMLAttributes<HTMLDivElement>> = ({
    variant = 'default',
    label,
    description,
    descriptionPosition = 'bottom',
    leadIcon,
    src,
    alt,
    trailIcon,
    ...props
}) => {
    const theme = useTheme()
    const listItemDescription = (
        <StyledListItemDescription>{description}</StyledListItemDescription>
    )

    return (
        <StyledListItemContainer
            role="listitem"
            variant={variant}
            // TODO(React18): Remove this once we upgrade to React 18
            theme={theme as unknown as ChatTheme}
            {...props}
        >
            {leadIcon && <StyledLeadIcon>{leadIcon}</StyledLeadIcon>}
            {!leadIcon && src && (
                <StyledImage
                    role="img"
                    src={src}
                    aria-label={alt}
                    variant={variant}
                />
            )}
            <StyledListItemContent>
                <StyledListItemLabel>{label}</StyledListItemLabel>
                {description &&
                    descriptionPosition === 'bottom' &&
                    listItemDescription}
            </StyledListItemContent>
            <StyledTrailContent>
                {description &&
                    descriptionPosition === 'right' &&
                    listItemDescription}
                {trailIcon && (
                    // TODO(React18): Remove this once we upgrade to React 18
                    <StyledTrailIcon theme={theme as unknown as ChatTheme}>
                        {trailIcon}
                    </StyledTrailIcon>
                )}
            </StyledTrailContent>
        </StyledListItemContainer>
    )
}

export default ListItem
