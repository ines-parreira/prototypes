import { useKey } from '@repo/hooks'
import classNames from 'classnames'

import {
    NodeProps,
    NodeWrapper,
    StepCard,
    StepCardActionMenu,
    StepCardActionMenuItem,
} from 'core/ui/flows'
import { Drawer } from 'pages/common/components/Drawer'
import LearnMoreLink from 'pages/common/components/LearnMore/LearnMoreLink'

import { useVoiceFlow } from '../useVoiceFlow'
import { useDeleteNode } from '../utils/useDeleteNode'
import { useVoiceFlowContext } from '../VoiceFlowContext'

import css from './VoiceStepNode.less'

type VoiceStepNodeProps = NodeProps & {
    title: string
    description: string
    icon: React.ReactNode
    errors: string[]
    warnings?: string[]
    children: React.ReactNode
    drawerRef?: React.RefObject<HTMLDivElement>
}

export function VoiceStepNode({
    title,
    description,
    icon,
    errors = [],
    warnings = [],
    children,
    drawerRef,
    ...rest
}: VoiceStepNodeProps) {
    const { selectedNode, setSelectedNode } = useVoiceFlowContext()
    const selected = selectedNode === rest.id
    const { updateNode } = useVoiceFlow()
    const { deleteNode } = useDeleteNode()

    const handleDrawerClose = () => {
        setSelectedNode(null)
        // Update the React Flow node's selected state to avoid re-render issues
        updateNode(rest.id, { selected: false })
    }

    const handleDrawerOpen = () => {
        setSelectedNode(rest.id)
    }

    useKey(
        'Escape',
        () => {
            handleDrawerClose()
        },
        undefined,
        [handleDrawerClose],
    )

    return (
        <>
            <NodeWrapper {...rest}>
                <div onClick={handleDrawerOpen} aria-label={'Step node'}>
                    <StepCard
                        icon={icon}
                        title={title}
                        description={description}
                        isSelected={selected}
                        errors={errors}
                        warnings={warnings}
                    >
                        <StepCardActionMenu>
                            <StepCardActionMenuItem
                                label="Delete"
                                icon={
                                    <i
                                        className={classNames(
                                            'material-icons-outlined',
                                            css.deleteIcon,
                                        )}
                                    >
                                        delete
                                    </i>
                                }
                                onClick={() => {
                                    deleteNode(rest.id)
                                }}
                            />
                        </StepCardActionMenu>
                    </StepCard>
                </div>
            </NodeWrapper>
            <Drawer
                className={css.drawer}
                fullscreen={false}
                aria-label={title}
                open={selected}
                portalRootId="app-root"
                isLoading={false}
                withFooter={false}
                showBackdrop={false}
                containerZIndices={[10, 10]}
            >
                <Drawer.Header className={css.drawerHeader}>
                    <span>{title}</span>
                    <Drawer.HeaderActions
                        onClose={handleDrawerClose}
                        closeButtonId="close-button"
                        className={css.headerActions}
                    ></Drawer.HeaderActions>
                </Drawer.Header>

                <Drawer.Content>
                    <div className={css.learnMoreLink}>
                        <LearnMoreLink url="https://docs.gorgias.com/en-US/manage-gorgias-call-flows-and-ivr-menus-296981">
                            Learn more about Call Flows
                        </LearnMoreLink>
                    </div>
                    <div className={css.drawerForm} ref={drawerRef}>
                        {children}
                    </div>
                </Drawer.Content>
            </Drawer>
        </>
    )
}
