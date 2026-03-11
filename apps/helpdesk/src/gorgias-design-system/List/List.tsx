import type { HTMLAttributes } from 'react'
import type React from 'react'

import styled from '@emotion/styled'

import { gorgiasColors } from 'gorgias-design-system/styles'

type ListProps = {
    /**
     * Determines whether a shadow should be displayed around the component or not.
     * @default true
     * */
    shouldDisplayShadow?: boolean
}

const StyledList = styled.div<ListProps>`
    border-radius: 8px;
    padding: 8px;

    background: ${gorgiasColors.neutralGrey0};

    ${({ shouldDisplayShadow }) =>
        shouldDisplayShadow
            ? `box-shadow: 1px 1px 8px 0px rgba(22, 22, 22, 0.05);`
            : ''}
`

/**
 * A component that is used to display multiple <ListItem\/> components together in a compact way.
 * @param children The <ListItem\/> components to be displayed.
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<List />` from @gorgias/axiom instead.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
const List: React.FC<HTMLAttributes<HTMLDivElement> & ListProps> = ({
    children,
    ...props
}) => {
    const { shouldDisplayShadow = true } = props

    return (
        <StyledList
            shouldDisplayShadow={shouldDisplayShadow}
            role="list"
            {...props}
        >
            {children}
        </StyledList>
    )
}

export default List
