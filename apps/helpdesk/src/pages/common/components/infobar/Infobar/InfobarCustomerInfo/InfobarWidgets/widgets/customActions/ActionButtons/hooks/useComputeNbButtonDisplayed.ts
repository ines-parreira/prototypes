import { useEffect, useState } from 'react'

import { useDebouncedEffect } from '@repo/hooks'

import { Source } from 'models/widget/types'
import { computeNbButtonDisplayed } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/ActionButtons/helpers/computeNbButtonDisplayed'
import { NB_MIN_BUTTON_DISPLAYED } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/constants'
import { useTemplateContext } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/hooks/useTemplateContext'
import { Button as ButtonType } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'

export function useComputeNbButtonDisplayed(
    buttons: ButtonType[],
    containerRef: React.RefObject<HTMLDivElement>,
    source: Source,
) {
    const [availableSpace, setAvailableSpace] = useState<number | undefined>()
    const [nbButtonDisplayed, setNbButtonDisplayed] = useState<number>(
        NB_MIN_BUTTON_DISPLAYED,
    )
    const templateContext = useTemplateContext(source)

    useEffect(() => {
        if (ResizeObserver && containerRef.current) {
            const resizeObserver = new ResizeObserver((entries) => {
                const width = entries[0].borderBoxSize[0].inlineSize
                setAvailableSpace(width)
            })
            resizeObserver.observe(containerRef.current)
            return () => {
                resizeObserver.disconnect()
            }
        }
    }, [containerRef])

    useDebouncedEffect(
        () => {
            setNbButtonDisplayed(
                computeNbButtonDisplayed(
                    buttons,
                    templateContext,
                    availableSpace,
                ),
            )
        },
        [buttons, availableSpace],
        200,
    )

    return nbButtonDisplayed
}
