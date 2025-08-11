import { Label } from '@gorgias/axiom'

import TextArea from '../../../../../gorgias-design-system/Input/TextArea'

import feedbackCreateResourceCss from './FeedbackCreateResource.less'
import css from './FeedbackNote.less'

type Props = {
    onBlur: (e: React.ChangeEvent) => void
    value: string
}

const FeedbackOrders: React.FC<Props> = ({ onBlur, value }) => {
    return (
        <div className={css.container}>
            <Label>Internal note</Label>
            <TextArea
                id="ai-message-feedback-issues-note"
                data-testid="ai-message-feedback-issues-note-test-id"
                name="description"
                isValid
                rows={1}
                onBlur={onBlur}
                value={value}
            />
            <div className={feedbackCreateResourceCss.info}>
                Keep track of specific AI Agent issues. Gorgias uses these notes
                to monitor conversation quality.
            </div>
        </div>
    )
}

export default FeedbackOrders
