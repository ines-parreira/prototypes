import React, { useState } from 'react'

import classNames from 'classnames'
import { Card, CardBody, CardHeader, Collapse } from 'reactstrap'

import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import InstallationCodeSnippet from 'pages/common/components/InstallationCodeSnippet/InstallationCodeSnippet'

import { InstructionTab } from './types'

import css from './InstructionsCard.less'

function InstructionsCardHeader(props: {
    title: string
    description: JSX.Element
    toggleIsOpen: () => void
    isOpen: boolean
}) {
    const { title, description, toggleIsOpen, isOpen } = props
    return (
        <CardHeader className={css.instructionsCardHeader}>
            <div>
                <h3 className={css.mbXs}>{title}</h3>
                <p>{description}</p>
            </div>
            <button
                onClick={toggleIsOpen}
                aria-label={isOpen ? 'collapse card' : 'expand card'}
            >
                <i className={`material-icons`}>
                    {isOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                </i>
            </button>
        </CardHeader>
    )
}

function Instructions(props: { instructions: string[] }) {
    const { instructions } = props

    if (instructions.length === 0) {
        return null
    }

    return (
        <div className={classNames(css.instructions, css.mbM)}>
            {instructions.map((instruction, index) => {
                return (
                    <div key={index} className={css.instruction}>
                        <div>
                            <div className={css['instruction-number']}>
                                {index + 1}
                            </div>
                        </div>
                        <div
                            dangerouslySetInnerHTML={{ __html: instruction }}
                        />
                    </div>
                )
            })}
        </div>
    )
}

function InstructionAlert(props: { alert?: string }) {
    const { alert } = props

    if (!alert) {
        return null
    }

    return (
        <Alert type={AlertType.Warning} className={css.mbM}>
            <span dangerouslySetInnerHTML={{ __html: alert }} />
        </Alert>
    )
}

function TabNavigation(props: {
    tabs: InstructionTab[]
    activeTabId: string
    setActiveTabId: React.Dispatch<React.SetStateAction<string>>
}) {
    const { tabs, activeTabId, setActiveTabId } = props

    // we don't display the tab navigation if there is only one tab
    if (tabs.length <= 1) {
        return null
    }

    return (
        <div className={classNames(css.tabNavigation, css.mbM)}>
            {tabs.map((tab) => (
                <div
                    key={tab.id}
                    className={classNames(css.tabNavigationItem, {
                        [css.isActive]: tab.id === activeTabId,
                    })}
                    onClick={() => setActiveTabId(tab.id)}
                >
                    {tab.title}
                </div>
            ))}
        </div>
    )
}

function TabContent(props: {
    tabs: InstructionTab[]
    activeTabId: string
    onCopyClick?: () => void
}) {
    const { tabs, activeTabId, onCopyClick } = props
    const activeTab = tabs.find((tab) => tab.id === activeTabId)
    if (!activeTab) return null
    const { instructions, instructionAlert, code } = activeTab

    return (
        <>
            <Instructions instructions={instructions} />
            <InstructionAlert alert={instructionAlert} />
            {code ? (
                <InstallationCodeSnippet onCopy={onCopyClick} code={code} />
            ) : null}
        </>
    )
}

export type InstructionsCardProps = {
    title: string
    description: JSX.Element
    initialIsOpen?: boolean
    tabs: [InstructionTab, ...InstructionTab[]]
    onCopyClick?: () => void
}

const InstructionsCard = ({
    title,
    description,
    tabs,
    onCopyClick,
    initialIsOpen = true,
}: InstructionsCardProps) => {
    const [isOpen, setIsOpen] = useState(initialIsOpen)
    const [activeTabId, setActiveTabId] = useState(tabs[0].id)

    return (
        <Card data-is-open={isOpen} className={css.instructionsCard}>
            <InstructionsCardHeader
                title={title}
                description={description}
                isOpen={isOpen}
                toggleIsOpen={() => setIsOpen((state) => !state)}
            />
            <Collapse isOpen={isOpen}>
                <CardBody className={css.instructionsCardBody}>
                    <TabNavigation
                        activeTabId={activeTabId}
                        setActiveTabId={setActiveTabId}
                        tabs={tabs}
                    />
                    <TabContent
                        activeTabId={activeTabId}
                        onCopyClick={onCopyClick}
                        tabs={tabs}
                    />
                </CardBody>
            </Collapse>
        </Card>
    )
}

export default InstructionsCard
