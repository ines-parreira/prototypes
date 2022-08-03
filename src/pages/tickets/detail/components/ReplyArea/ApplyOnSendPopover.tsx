import classNames from 'classnames'
import {List, Map} from 'immutable'
import React from 'react'
import {useLocalStorage} from 'react-use'
import {Popover, PopoverBody, Button} from 'reactstrap'
import {MacroActionName} from 'models/macroAction/types'
import css from './ApplyOnSendPopover.less'

type Props = {
    actions: List<Map<any, any>>
}

// TODO: Delete this component after 2022-09-15

export default function TMPApplyOnSendPopover({actions}: Props) {
    const [hide, setHide] = useLocalStorage(`applyOnSendPopover`)
    const hasNewAction = actions.some((action) => {
        const name = action!.get('name') as string
        return (
            name !== MacroActionName.AddInternalNote &&
            !name.startsWith('shopify') &&
            !name.startsWith('recharge') &&
            name !== MacroActionName.Http
        )
    })

    const hasExpired = new Date() > new Date('2022-09-15') // Stop showing the popover after 2022-09-15

    return (
        <Popover
            target="submit-button"
            isOpen={!hide && hasNewAction && !hasExpired}
            placement="top-start"
        >
            <PopoverBody>
                <div
                    className={classNames('d-md-block p-1', css.popoverContent)}
                >
                    <span role="img" aria-label="waving hand">
                        👋
                    </span>{' '}
                    Hey there, we’ve made an update! All{' '}
                    <b>
                        macro actions will now be applied once a message is
                        sent.
                    </b>
                </div>
                <Button
                    intent="secondary"
                    size="small"
                    className="mt-2 mb-2"
                    onClick={() => setHide(true)}
                >
                    Got It
                </Button>
            </PopoverBody>
        </Popover>
    )
}
