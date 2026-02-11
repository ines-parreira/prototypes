import { Box, Button } from '@gorgias/axiom'

import Alert, { AlertType } from 'pages/common/components/Alert/Alert'

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
                    <Box>
                        <Button onClick={onClick}>{btnLabel}</Button>
                    </Box>
                }
                type={AlertType.Info}
            >
                {text}
            </Alert>
        </div>
    )
}

export default CanduActionInfobar
