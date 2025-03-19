import { Label } from '@gorgias/merchant-ui-kit'

import TextArea from '../../../../../gorgias-design-system/Input/TextArea'
import InfoIconWithTooltip from '../../../common/components/InfoIconWithTooltip'

import css from './FeedbackNote.less'

type Props = {
    onBlur: (e: React.ChangeEvent) => void
    value: string
}

const FeedbackOrders: React.FC<Props> = ({ onBlur, value }) => {
    return (
        <div className={css.container}>
            <Label>
                Note
                <InfoIconWithTooltip
                    id="tooltip-ai-agent-feedback-note"
                    tooltipProps={{ autohide: true, placement: 'bottom' }}
                >
                    <>
                        Keep track of specific details about AI Agent issues.
                        Gorgias occasionally checks these notes to help improve
                        AI Agent.
                    </>
                </InfoIconWithTooltip>
            </Label>
            <TextArea
                id="ai-message-feedback-issues-note"
                data-testid="ai-message-feedback-issues-note-test-id"
                name="description"
                isValid
                placeholder="AI Agent answered in Spanish instead of English, wrote too much and promised to accept a return on a non-returnable item."
                rows={1}
                onBlur={onBlur}
                value={value}
            />
            <div className={css.descriptionText}>
                Briefly describe what went wrong and what AI Agent should have
                done differently
            </div>
        </div>
    )
}

export default FeedbackOrders
