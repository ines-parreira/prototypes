import { Box, Icon, Tooltip, TooltipContent } from '@gorgias/axiom'

import type { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'

type Props = {
    action: StoreWorkflowsConfiguration
}

const AUTONOMOUS_TOOLTIP =
    'AI Agent can run this action on its own, without it being referenced in a skill or guidance.'
const NOT_AUTONOMOUS_TOOLTIP =
    'This action only runs when referenced inside a skill or guidance.'

const AutonomousCell = ({ action }: Props) => {
    const entrypoint = action.entrypoints.find(
        (e) => e.kind === 'llm-conversation',
    )
    const isAutonomous = entrypoint?.settings.is_standalone === true

    return (
        <Tooltip
            trigger={
                <Box
                    display="inline-flex"
                    onClick={(event) => event.stopPropagation()}
                >
                    <Icon
                        name={isAutonomous ? 'check' : 'close'}
                        size="md"
                        color={
                            isAutonomous
                                ? 'content-success-default'
                                : 'content-neutral-tertiary'
                        }
                        alt={isAutonomous ? 'Autonomous' : 'Not autonomous'}
                    />
                </Box>
            }
        >
            <TooltipContent
                caption={
                    isAutonomous ? AUTONOMOUS_TOOLTIP : NOT_AUTONOMOUS_TOOLTIP
                }
            />
        </Tooltip>
    )
}

export default AutonomousCell
