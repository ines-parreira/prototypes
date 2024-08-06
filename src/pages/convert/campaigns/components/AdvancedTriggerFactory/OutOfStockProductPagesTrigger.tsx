import React from 'react'

import Button from 'pages/common/components/button/Button'

import css from './style.less'

export const OutOfStockProductPagesTrigger = (): JSX.Element => {
    return (
        <>
            <div>
                <Button
                    intent="secondary"
                    role="button"
                    aria-label="Out Of Stock Product Pages"
                    className="btn-frozen"
                >
                    Out Of Stock Product Pages
                </Button>
            </div>
            <div className={css.fixedOperator}>is visited</div>
        </>
    )
}
