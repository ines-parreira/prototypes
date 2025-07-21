import classnames from 'classnames'
import { Popover, PopoverBody } from 'reactstrap'

import { useAppNode } from 'appNode'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import Button from 'pages/common/components/button/Button'
import {
    setShowConvertToForwardPopover,
    setSourceExtra,
} from 'state/newMessage/actions'
import {
    getNewMessageExtra,
    getShowConvertToForwardPopover,
} from 'state/newMessage/selectors'

import css from './ConvertToForwardPopover.less'

type Props = {
    target: React.RefObject<HTMLElement>
}

const ConvertToForwardPopover: React.FC<Props> = ({ target }) => {
    const dispatch = useAppDispatch()
    const extra = useAppSelector(getNewMessageExtra)
    const showConvertToForwardPopover = useAppSelector(
        getShowConvertToForwardPopover,
    )
    const appNode = useAppNode()

    const onClose = () => dispatch(setShowConvertToForwardPopover(false))

    const onConvert = () => {
        onClose()
        dispatch(setSourceExtra({ ...extra.toJS(), forward: true }))
    }

    return (
        <Popover
            placement="top"
            target={target}
            isOpen={!!showConvertToForwardPopover}
            fade={true}
            popperClassName={css.popover}
            trigger="legacy"
            container={appNode ?? undefined}
        >
            <PopoverBody>
                <p>This thread has been converted to email.</p>
                <Button
                    className={classnames(css.button, 'mr-2')}
                    onClick={onClose}
                >
                    Understood
                </Button>
                <Button
                    className={css.button}
                    intent="secondary"
                    onClick={onConvert}
                >
                    Change To Forward
                </Button>
            </PopoverBody>
        </Popover>
    )
}

export default ConvertToForwardPopover
