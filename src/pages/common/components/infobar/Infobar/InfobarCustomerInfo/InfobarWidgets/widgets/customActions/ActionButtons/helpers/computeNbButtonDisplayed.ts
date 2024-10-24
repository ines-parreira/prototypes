import {
    SHOW_MORE_WIDTH,
    NB_MIN_BUTTON_DISPLAYED,
    FONT_SIZE,
    BUTTON_SPACING,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/constants'
import {applyCustomActionTemplate} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/helpers/templating'
import {
    Button as ButtonType,
    TemplateContext,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'

export function computeNbButtonDisplayed(
    buttons: ButtonType[],
    templateContext: TemplateContext,
    availableSpace: number | undefined
) {
    // First pass, we see how many buttons we can fit until we overflow
    if (buttons.length <= NB_MIN_BUTTON_DISPLAYED || !availableSpace)
        return NB_MIN_BUTTON_DISPLAYED

    let nbButtonDisplayed = 0
    let computedLength = 0

    while (
        nbButtonDisplayed < buttons.length &&
        computedLength <= availableSpace
    ) {
        computedLength += computeButtonLength(
            buttons[nbButtonDisplayed].label,
            templateContext
        )
        nbButtonDisplayed++
    }

    // Second pass, we remove buttons until they fit, with the "show more"
    // button if needed.
    let newAvailablePxSpace = availableSpace
    if (nbButtonDisplayed < buttons.length)
        newAvailablePxSpace = availableSpace - SHOW_MORE_WIDTH

    while (computedLength > newAvailablePxSpace && nbButtonDisplayed > 0) {
        nbButtonDisplayed--
        computedLength -= computeButtonLength(
            buttons[nbButtonDisplayed].label,
            templateContext
        )
        if (nbButtonDisplayed < buttons.length)
            newAvailablePxSpace = availableSpace - SHOW_MORE_WIDTH
    }

    return nbButtonDisplayed < NB_MIN_BUTTON_DISPLAYED
        ? NB_MIN_BUTTON_DISPLAYED
        : nbButtonDisplayed
}

export function computeButtonLength(
    label: string,
    templateContext: TemplateContext
) {
    return (
        applyCustomActionTemplate(label, templateContext).length * FONT_SIZE +
        BUTTON_SPACING
    )
}
