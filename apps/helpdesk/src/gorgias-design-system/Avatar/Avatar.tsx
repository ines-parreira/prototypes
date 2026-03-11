import type { FC, HTMLAttributes } from 'react'

import styled from '@emotion/styled'

import { gorgiasColors } from '../styles'
import BotIcon from './icons/BotIcon'
import { getInitials } from './utils'

export const StyledAvatarName = styled.span`
    color: ${gorgiasColors.dark};
    font-size: 14px;
    font-weight: 500;
    letter-spacing: -0.01em;
`

export const StyledAvatarContainer = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 8px;
`

const StyledStatusIndicator = styled.div`
    position: absolute;
    bottom: 0;
    right: 0;

    width: 25%;
    height: 25%;

    background-color: ${gorgiasColors.secondaryGreen};

    outline: 1.5px solid ${gorgiasColors.white};
    border-radius: 50%;
`

export const StyledAvatar = styled.div<
    Pick<AvatarProps, 'src' | 'isBot'> & { size: number }
>`
    display: inline-block;
    position: relative;

    border-radius: 50%;

    background-image: ${({ isBot, src }) => (isBot ? 'none' : `url(${src!})`)};
    background-size: cover;
    background-position: center;
    background-color: ${({ isBot }) =>
        isBot ? gorgiasColors.neutralGrey4 : gorgiasColors.neutralGrey2};

    svg {
        width: 64.31%;
    }

    ${({ size }) =>
        `width: ${size}px; height: ${size}px; font-size: ${Math.floor(
            size * 0.375,
        )}px;`}

    font-weight: 600;

    display: flex;
    justify-content: center;
    align-items: center;

    text-transform: uppercase;
    color: ${({ src }) => (src ? 'transparent' : gorgiasColors.neutralGrey4)};
`

export type AvatarProps = {
    /**
     * Whether to display an icon representing a bot instead of an image or initials.
     */
    isBot?: boolean

    showPlaceholderAvatar?: boolean

    /**
     * The source URL of the image to display in the avatar.
     */
    src?: string

    /**
     * The name of the user to display as initials in the avatar.
     */
    name?: string
    /**
     * Whether to show the provided name next to the avatar.
     */
    showName?: boolean

    /**
     * Whether to display a green circle indicating the user is online.
     */
    hasStatusIndicator?: boolean

    /**
     * The size of the avatar in pixels.
     */
    size?: number
}

/**
 * A component that represents a profile picture or an image used to identify a user or a bot.
 * It can display either an image, a bot icon, or initials as fallback.
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<Avatar />` from @gorgias/axiom instead.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
const Avatar: FC<AvatarProps & HTMLAttributes<HTMLDivElement>> = ({
    isBot,
    showPlaceholderAvatar,
    src,
    name,
    showName,
    hasStatusIndicator,
    size = 32,
    ...props
}) => {
    return (
        <StyledAvatarContainer className="avatar-container">
            <StyledAvatar
                className="avatar"
                src={src}
                isBot={isBot}
                size={size}
                {...props}
            >
                {showPlaceholderAvatar ? (
                    <i className="material-icons">person</i>
                ) : (
                    <>
                        {isBot && <BotIcon />}
                        {!isBot && name && getInitials(name)}
                    </>
                )}
                {hasStatusIndicator && <StyledStatusIndicator />}
            </StyledAvatar>
            {showName && name && (
                <StyledAvatarName className="avatar-name">
                    {name}
                </StyledAvatarName>
            )}
        </StyledAvatarContainer>
    )
}

export default Avatar
