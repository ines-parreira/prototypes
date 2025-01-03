import React from 'react'

import AppIcon from 'pages/automate/actionsPlatform/components/AppIcon'
import {App} from 'pages/automate/actionsPlatform/types'

import css from './ReusableLLMPromptCallNodeLabel.less'

type Props = {
    app: App
    name: string
}

const ReusableLLMPromptCallNodeLabel = ({app, name}: Props) => {
    return (
        <div className={css.container}>
            <AppIcon icon={app.icon} name={app.name} />
            <span className={css.title}>
                {name} in {app.name}
            </span>
        </div>
    )
}

export default ReusableLLMPromptCallNodeLabel
