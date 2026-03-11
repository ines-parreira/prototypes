import type { FC, HTMLAttributes } from 'react'

import styled from '@emotion/styled'

import { gorgiasColors } from '../styles'

const StyledAvatarGroup = styled.div`
    display: inline-flex;
    flex-direction: row-reverse;

    .avatar-container {
        &:not(:last-of-type) {
            margin-left: -12px;
        }

        .avatar {
            outline: 3px solid ${gorgiasColors.white};
        }
    }

    .avatar-name {
        display: none;
    }
`

/**
 * A component that is used to display multiple <Avatar\/> components together in a compact way.
 * Avatars placed in this component will be displayed in reverse order.
 * @param children The <Avatar\/> components to be displayed.
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<AvatarGroup />` from @gorgias/axiom instead.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
const AvatarGroup: FC<HTMLAttributes<HTMLDivElement>> = ({
    children,
    ...props
}) => {
    return <StyledAvatarGroup {...props}>{children}</StyledAvatarGroup>
}

export default AvatarGroup
