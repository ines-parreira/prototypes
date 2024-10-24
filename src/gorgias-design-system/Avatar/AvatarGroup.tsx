import styled from '@emotion/styled'
import React, {HTMLAttributes} from 'react'

import {gorgiasColors} from '../styles'

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
 */
const AvatarGroup: React.FC<HTMLAttributes<HTMLDivElement>> = ({
    children,
    ...props
}) => {
    return <StyledAvatarGroup {...props}>{children}</StyledAvatarGroup>
}

export default AvatarGroup
