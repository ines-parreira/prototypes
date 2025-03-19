import { Link } from 'react-router-dom'

import Alert, { AlertType } from 'pages/common/components/Alert/Alert'

import css from './TrainMyAiAlerts.less'

export const RecommendationDisabled = ({ link }: { link: string }) => (
    <Alert
        icon
        className={css.alert}
        type={AlertType.Warning}
        customActions={<Link to={link}>Enable</Link>}
    >
        Article Recommendation is disabled in Chat so no more recommendations
        will be sent to customers and no new training data will be available.
    </Alert>
)
