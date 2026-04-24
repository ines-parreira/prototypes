import { useHelpdeskV2BaselineFlag } from '@repo/feature-flags'

import {
    Link,
    MenuItem,
    MenuSection,
    ToggleField,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

export function UserMenuBetaSection() {
    const {
        hasUIVisionBetaBaselineFlag,
        hasUIVisionBeta,
        onToggle: onToggleHelpdeskV2Beta,
    } = useHelpdeskV2BaselineFlag()

    if (!hasUIVisionBetaBaselineFlag) return null

    return (
        <MenuSection id="beta-ui">
            <MenuItem
                label="New UI"
                onAction={onToggleHelpdeskV2Beta}
                trailingSlot={
                    <Tooltip trigger={<ToggleField value={hasUIVisionBeta} />}>
                        <TooltipContent>
                            Gorgias has a refreshed look! If anything isn&apos;t
                            working as expected, you can switch back temporarily
                            with this toggle.
                        </TooltipContent>
                    </Tooltip>
                }
            />
            <MenuItem
                as={Link}
                href="https://gorgias.typeform.com/to/htnf1rc4"
                target="_blank"
                rel="noreferrer noopener"
                label={<Link trailingSlot="external-link">Leave feedback</Link>}
            />
        </MenuSection>
    )
}
