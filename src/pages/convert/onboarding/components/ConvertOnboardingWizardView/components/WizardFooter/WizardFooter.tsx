import React from 'react'

import { Link } from 'react-router-dom'

import Button from 'pages/common/components/button/Button'

import css from './WizardFooter.less'

type Props = {
    integrationId: number
    nextStepLabel?: string
    isLoading?: boolean
    handleNextStep: () => void
    handleBack: () => void
}

const WizardFooter = ({
    integrationId,
    nextStepLabel,
    isLoading,
    handleNextStep,
    handleBack,
}: Props) => {
    return (
        <div className={css.footer}>
            <div className={css.footerShadow}></div>
            <div className={css.footerBackground}>
                <div className={css.footerContent}>
                    <Link to={`/app/convert/${integrationId}/setup#later`}>
                        <Button fillStyle="ghost">
                            Save &amp; Customize Later
                        </Button>
                    </Link>

                    <div className={css.wizardButtons}>
                        <Button intent="secondary" onClick={handleBack}>
                            Previous
                        </Button>
                        <Button onClick={handleNextStep} isLoading={isLoading}>
                            {nextStepLabel || 'Finish Setup'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WizardFooter
