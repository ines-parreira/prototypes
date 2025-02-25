import React from 'react'

import classnames from 'classnames'

import AppIcon from 'pages/automate/actionsPlatform/components/AppIcon'
import { App } from 'pages/automate/actionsPlatform/types'

import css from './ReusableLLMPromptCallNodeLabel.less'

type Props = {
    app: App
    name: string
    variant?: 'bold' | 'regular'
}

const ReusableLLMPromptCallNodeLabel = ({
    app,
    name,
    variant = 'bold',
}: Props) => {
    return (
        <div className={css.container}>
            <AppIcon icon={app.icon} name={app.name} />
            <span className={classnames(css.title, css[variant])}>
                {name} in {app.name}
            </span>
        </div>
    )
}

export default ReusableLLMPromptCallNodeLabel
