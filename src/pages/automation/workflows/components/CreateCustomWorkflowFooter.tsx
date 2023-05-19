import React from 'react'
import classnames from 'classnames'

import Button from 'pages/common/components/button/Button'

import css from './CreateCustomWorkflowFooter.less'

type Props = {
    goToNewWorkflowPage: () => void
}

const CreateCustomWorkflowFooter = ({goToNewWorkflowPage}: Props) => {
    return (
        <div className={css.container}>
            <div className={css.content}>
                <p className={classnames(css.title, 'mb-2')}>
                    Can’t find what you’re looking for?
                </p>
                <p>Create a flow from scratch to fit your needs.</p>
                <Button onClick={goToNewWorkflowPage}>
                    Create Custom Flow
                </Button>
            </div>
        </div>
    )
}

export default CreateCustomWorkflowFooter
