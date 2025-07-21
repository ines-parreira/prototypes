import MainTitle from 'pages/aiAgent/Onboarding/components/MainTitle/MainTitle'
import { Subtitle } from 'pages/aiAgent/Onboarding/components/Subtitle/Subtitle'
import css from 'pages/aiAgent/Overview/components/Title/Title.less'

type Props = {
    firstName: string
    activationButton: React.ReactNode
}
export const Title = ({ firstName, activationButton }: Props) => {
    return (
        <div className={css.container}>
            <div className={css.titleContainer}>
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
            {activationButton}
        </div>
    )
}
