import { Button } from '@gorgias/axiom'

import Alert, { AlertType } from 'pages/common/components/Alert/Alert'

import css from './CanduActionInfobar.less'

type Props = {
    text: string
    btnLabel: string
    canduId?: string
    onClick?: () => void
}

const CanduActionInfobar = ({ text, btnLabel, canduId, onClick }: Props) => {
    return (
        <div data-candu-id={canduId}>
            <Alert
                className="mt-4"
                icon
                customActions={
                    <div className={css.actions}>
                        <Button className="mr-3" onClick={onClick}>
                            {btnLabel}
                        </Button>
                    </div>
                }
                type={AlertType.Info}
            >
                {text}
            </Alert>
        </div>
    )
}

export default CanduActionInfobar
