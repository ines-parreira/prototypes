import { useState } from 'react'

import classNames from 'classnames'

import {
    NodeWrapper,
    StepCard,
    StepCardActionMenu,
    StepCardActionMenuItem,
} from 'core/ui/flows'
import { Drawer } from 'pages/common/components/Drawer'
import LearnMoreLink from 'pages/common/components/LearnMore/LearnMoreLink'

import css from './VoiceStepNode.less'

type VoiceStepNodeProps = {
    title: string
    description: string
    icon: React.ReactNode
    errors: string[]
    children: React.ReactNode
}

export function VoiceStepNode({
    title,
    description,
    icon,
    errors = [],
    children,
}: VoiceStepNodeProps) {
    const [selected, setSelected] = useState(false)
    const handleDrawerClose = () => {
        setSelected(false)
    }

    return (
        <>
            <NodeWrapper>
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
                <Drawer.Header>
                    <span>{title}</span>
                    <Drawer.HeaderActions
                        onClose={handleDrawerClose}
                        closeButtonId="close-button"
                        className={css.headerActions}
                    >
                        <LearnMoreLink url="#">
                            Learn more about Call Flows
                        </LearnMoreLink>
                    </Drawer.HeaderActions>
                </Drawer.Header>
                <Drawer.Content>
                    <div className={css.drawerForm}>{children}</div>
                </Drawer.Content>
            </Drawer>
        </>
    )
}
