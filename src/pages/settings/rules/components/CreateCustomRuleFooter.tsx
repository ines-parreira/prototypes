import React from 'react'
import {Link} from 'react-router-dom'
import classnames from 'classnames'

import Button from 'pages/common/components/button/Button'

import css from './CreateCustomRuleFooter.less'

const CreateCustomRuleFooter: React.FC = () => (
    <div className={css.container}>
        <div className={css.content}>
            <p className={classnames(css.title, 'mb-2')}>
                Can’t find what you’re looking for?
            </p>
            <p>Create a rule from scratch to fit your needs.</p>
            <Link to="/app/settings/rules/new">
                <Button>Create Custom Rule</Button>
            </Link>
        </div>
    </div>
)

export default CreateCustomRuleFooter
