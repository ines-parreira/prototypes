import {
    Box,
    ButtonGroup,
    ButtonGroupItem,
    Heading,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { SkillWizardSkillStatus } from 'pages/aiAgent/skills/types'

type Props = {
    title: string
    status: SkillWizardSkillStatus
    onStatusChange: (status: SkillWizardSkillStatus) => void
    isApprovedDisabled?: boolean
    approvedDisabledReason?: string
}

export const SkillReviewCardHeader = ({
    title,
    status,
    onStatusChange,
    isApprovedDisabled = false,
    approvedDisabledReason,
}: Props) => {
    const buttonGroup = (
        <ButtonGroup
            selectedKey={status}
            onSelectionChange={(key) =>
                onStatusChange(key as SkillWizardSkillStatus)
            }
            size="md"
        >
            <ButtonGroupItem id={SkillWizardSkillStatus.Draft}>
                Keep as draft
            </ButtonGroupItem>
            <ButtonGroupItem
                id={SkillWizardSkillStatus.Approved}
                isDisabled={isApprovedDisabled}
                leadingSlot="check"
            >
                Looks good
            </ButtonGroupItem>
        </ButtonGroup>
    )

    return (
        <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            gap="md"
        >
            <Heading size="md">{title}</Heading>
            {isApprovedDisabled && approvedDisabledReason ? (
                <Tooltip delay={0} trigger={<Box>{buttonGroup}</Box>}>
                    <TooltipContent caption={approvedDisabledReason} />
                </Tooltip>
            ) : (
                buttonGroup
            )}
        </Box>
    )
}
