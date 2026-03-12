import type { ComponentProps } from 'react'
import { forwardRef } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { Button, Tooltip, TooltipContent } from '@gorgias/axiom'

import LegacyIconButtonTooltip from 'pages/common/components/PhoneIntegrationBar/OngoingPhoneCall/LegacyIconButtonTooltip'

type Props = ComponentProps<typeof Button> & {
    children: string
    legacyIcon: string
    legacyIconClassName?: string | undefined
}

const IconButtonTooltip = (
    { children, legacyIcon, legacyIconClassName = undefined, ...rest }: Props,
    ref?: React.ForwardedRef<HTMLButtonElement> | null,
) => {
    const applyCallBarRestyling = useFlag(FeatureFlagKey.CallBarRestyling)

    if (!applyCallBarRestyling) {
        return (
            <LegacyIconButtonTooltip
                intent="secondary"
                {...(rest as ComponentProps<typeof LegacyIconButtonTooltip>)}
                icon={legacyIcon}
                iconClassName={legacyIconClassName}
                ref={ref}
            >
                {children}
            </LegacyIconButtonTooltip>
        )
    }

    return (
        <Tooltip
            trigger={
                <Button variant="secondary" {...rest} ref={ref}>
                    {children}
                </Button>
            }
        >
            <TooltipContent title={children} />
        </Tooltip>
    )
}

export default forwardRef<HTMLButtonElement, Props>(IconButtonTooltip)
