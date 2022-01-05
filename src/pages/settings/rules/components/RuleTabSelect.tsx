import React from 'react'
import {Navbar, Nav} from 'reactstrap'
import classnames from 'classnames'

import {RuleTabs} from '../RulesView'

import css from './RuleTabSelect.less'

export type Props = {
    handleTabChange: (tab: RuleTabs) => void
    activeTab: string
    hasUnseenRules: boolean
}

function RuleTabSelect({handleTabChange, activeTab, hasUnseenRules}: Props) {
    const tabLabels = {
        [RuleTabs.AccountRules]: 'My rules',
        [RuleTabs.RuleLibrary]: 'Rule library',
    }
    return (
        <Navbar className={css.navbar}>
            {Object.keys(tabLabels).map((tab: string) => (
                <Nav
                    key={tab}
                    onClick={() => handleTabChange(tab as RuleTabs)}
                    className={classnames(css.item, {
                        [css.active]: activeTab === tab,
                        [css.newRules]:
                            tab === RuleTabs.AccountRules && hasUnseenRules,
                    })}
                >
                    {tabLabels[tab as RuleTabs]}
                </Nav>
            ))}
        </Navbar>
    )
}

export default RuleTabSelect
