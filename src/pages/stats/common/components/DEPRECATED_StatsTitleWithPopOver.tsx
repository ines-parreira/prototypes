import React from 'react'
import {Button} from 'reactstrap'
import {Map} from 'immutable'

import PopoverModal from '../../../common/components/PopoverModal'

import css from './DEPRECATED_StatsTitleWithPopOver.less'

type Props = {
    config: Map<any, any>
}

const StatsTitleWithPopOver = ({config}: Props) => (
    <h1 className="align-items-center">
        <span>{config.get('title') ?? config.get('name')}</span>
        <PopoverModal className="ml-3" placement="bottom-start">
            <p className={css.learnMoreContent}>
                {typeof config.get('description') === 'function'
                    ? (config.get('description') as () => JSX.Element)()
                    : config.get('description')}
            </p>
            <Button
                className={css.titleTooltipButton}
                color="secondary"
                type="button"
                onClick={() => {
                    window.open(config.get('url'), '_blank')!.focus()
                }}
            >
                Learn More <i className="material-icons">arrow_forward</i>
            </Button>
        </PopoverModal>
    </h1>
)

export default StatsTitleWithPopOver
