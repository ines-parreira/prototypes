import React from 'react'
import {Popover, PopoverBody} from 'reactstrap'
import classnames from 'classnames'

import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'

import {
    setSourceExtra,
    setShowConvertToForwardPopover,
} from 'state/newMessage/actions'

import {
    getShowConvertToForwardPopover,
    getNewMessageExtra,
} from 'state/newMessage/selectors'

import Button from 'pages/common/components/button/Button'

import css from './ConvertToForwardPopover.less'

type Props = {
    target: React.RefObject<HTMLElement>
}

const ConvertToForwardPopover: React.FC<Props> = ({target}) => {
    const dispatch = useAppDispatch()
    const extra = useAppSelector(getNewMessageExtra)
    const showConvertToForwardPopover = useAppSelector(
        getShowConvertToForwardPopover
    )

    const onClose = () => dispatch(setShowConvertToForwardPopover(false))

    const onConvert = () => {
        onClose()
        dispatch(setSourceExtra({...extra.toJS(), forward: true}))
    }

    return (
        <Popover
            placement="top"
            target={target}
            isOpen={!!showConvertToForwardPopover}
            fade={true}
            popperClassName={css.popover}
            trigger="legacy"
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
