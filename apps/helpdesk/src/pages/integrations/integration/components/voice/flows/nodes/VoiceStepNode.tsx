import { useState } from 'react'

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

import css from './VoiceStepNode.less'

type VoiceStepNodeProps = NodeProps & {
    title: string
    description: string
    icon: React.ReactNode
    errors: string[]
    children: React.ReactNode
    drawerRef?: React.RefObject<HTMLDivElement>
}

export function VoiceStepNode({
    title,
    description,
    icon,
    errors = [],
    children,
    drawerRef,
    ...rest
}: VoiceStepNodeProps) {
    const [selected, setSelected] = useState(rest.selected || false)
    const handleDrawerClose = () => {
        setSelected(false)
    }

    return (
        <>
            <NodeWrapper {...rest}>
                <div onClick={() => setSelected(true)} aria-label={'Step node'}>
                    <StepCard
                        icon={icon}
                        title={title}
                        description={description}
                        isSelected={selected}
                        errors={errors}
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
                                onClick={() => {}}
                            />
                        </StepCardActionMenu>
                    </StepCard>
                </div>
            </NodeWrapper>
            <Drawer
                fullscreen={false}
                aria-label={title}
                open={selected}
                portalRootId="app-root"
                onBackdropClick={handleDrawerClose}
                isLoading={false}
                withFooter={false}
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
                        <LearnMoreLink url="#">
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
