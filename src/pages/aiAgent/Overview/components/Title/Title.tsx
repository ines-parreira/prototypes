import React from 'react'

import MainTitle from 'pages/aiAgent/Onboarding/components/MainTitle/MainTitle'
import { Subtitle } from 'pages/aiAgent/Onboarding/components/Subtitle/Subtitle'
import css from 'pages/aiAgent/Overview/components/Title/Title.less'

type Props = {
    firstName: string
}
export const Title = ({ firstName }: Props) => {
    return (
        <div className={css.container}>
            <MainTitle
                titleBlack="Welcome, "
                titleMagenta={`${firstName}!`}
                className={css.title}
            />
            <Subtitle>
                Track your AI Agent’s performance and act on areas for
                improvement.
            </Subtitle>
        </div>
    )
}
