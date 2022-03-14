import React from 'react'
import Button from 'pages/common/components/button/Button'
import history from 'pages/history'

import robot from 'assets/img/rule-upsell-robot.svg'

import css from './RuleGettingStarted.less'

type Props = {
    goToLibrary: () => void
}
export default function UpsellComponent({goToLibrary}: Props) {
    return (
        <div className={css.container}>
            <img src={robot} alt="Empty rules" />
            <div>
                <h2>Start by installing a template</h2>
                <p>Automate your workflow with rules</p>
                <div className={css.buttonWrapper}>
                    <Button onClick={goToLibrary}>Visit rule library</Button>
                    <Button
                        className="ml-2"
                        intent="secondary"
                        onClick={() => history.push('/app/settings/rules/new')}
                    >
                        Create rule
                    </Button>
                </div>
            </div>
        </div>
    )
}
