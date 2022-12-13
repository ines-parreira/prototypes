import React from 'react'
import classnames from 'classnames'

import Button from 'pages/common/components/button/Button'

import ruleTemplates from 'assets/img/presentationals/rule-templates.png'

import TrackedRuleLibraryLink, {Source} from './TrackedRuleLibraryLink'

import css from './CreateRuleFooter.less'

const CreateRuleFooter: React.FC = () => {
    return (
        <div className={css.container}>
            <div className={css.wrapper}>
                <div className={css.content}>
                    <div className={css.textContainer}>
                        <div>
                            <p className={classnames(css.title, 'mb-2')}>
                                Automate up to 13% of tickets with rules
                            </p>
                            <p className={css.description}>
                                Start with a rule template to proactively
                                identify leads, prioritize urgent shopper
                                requests, and more!
                            </p>
                            <TrackedRuleLibraryLink
                                from={Source.CreateRuleFooter}
                            >
                                <Button>Create Rule</Button>
                            </TrackedRuleLibraryLink>
                        </div>
                    </div>
                    <div className={css.imageContainer}>
                        <img
                            className={css.image}
                            src={ruleTemplates}
                            alt="Rule Templates"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateRuleFooter
