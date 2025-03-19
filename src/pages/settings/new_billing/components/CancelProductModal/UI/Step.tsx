import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'

import css from './Step.less'

type StepProps = {
    body: React.ReactNode
    footer: React.ReactNode
}
const Step = ({ body, footer }: StepProps) => {
    return (
        <>
            <ModalBody className="body-regular">{body}</ModalBody>
            <ModalActionsFooter>
                <div className={css.footer}>{footer}</div>
            </ModalActionsFooter>
        </>
    )
}

export default Step
