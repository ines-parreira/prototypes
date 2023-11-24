import React from 'react'

import Button from 'pages/common/components/button/Button'
import preview from 'assets/img/workflows/preview.png'

import css from './CreateWorkflowFooter.less'

type Props = {
    goToWorkflowTemplatesPage: () => void
}

const CreateWorkflowFooter = ({goToWorkflowTemplatesPage}: Props) => {
    return (
        <div className={css.container}>
            <div className={css.wrapper}>
                <div className={css.content}>
                    <div className={css.header}>
                        <div className={css.title}>
                            Automate multi-step interactions with flows
                        </div>
                        <div className={css.description}>
                            Help customers select products, answer support
                            questions, and more with flows!
                        </div>
                    </div>
                    <Button onClick={goToWorkflowTemplatesPage}>
                        Create new flow
                    </Button>
                </div>
                <img className={css.image} src={preview} alt="" />
            </div>
        </div>
    )
}

export default CreateWorkflowFooter
