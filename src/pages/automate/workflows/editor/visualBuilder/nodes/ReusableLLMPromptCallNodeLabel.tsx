import classNames from 'classnames'
import React from 'react'

import AppIcon from 'pages/automate/actionsPlatform/components/AppIcon'
import {App} from 'pages/automate/actionsPlatform/types'

import css from './ReusableLLMPromptCallNodeLabel.less'

type Props = {
    app: App
    name: string
    center?: boolean
}

const ReusableLLMPromptCallNodeLabel = ({app, name, center}: Props) => {
    return (
        <div className={classNames(css.container, center && css.center)}>
            <AppIcon icon={app.icon} name={app.name} />
            <span className={css.title}>
                {name} in {app.name}
            </span>
        </div>
    )
}

export default ReusableLLMPromptCallNodeLabel
