import React from 'react'
import image1PageLayout from 'assets/img/icons/layout-1-pager.svg'
import imageCardLayout from 'assets/img/icons/layout-card.svg'
import {PreviewRadioButton} from 'pages/common/components/PreviewRadioButton'
import Caption from 'pages/common/forms/Caption/Caption'
import {HelpCenterLayout} from '../../types/layout.enum'

import css from './LayoutSwitch.less'

export type LayoutSwitchProps = {
    selectedLayout: HelpCenterLayout
    onLayoutChange: (layout: HelpCenterLayout) => void
    isOnePagerDisabled: boolean
}

export const LayoutSwitch = ({
    selectedLayout,
    onLayoutChange,
    isOnePagerDisabled,
}: LayoutSwitchProps) => {
    return (
        <div className={css.container}>
            <div className="heading-section-semibold">Layout</div>
            <div className={css.list}>
                <PreviewRadioButton
                    isSelected={selectedLayout === HelpCenterLayout.ONEPAGER}
                    value={HelpCenterLayout.ONEPAGER}
                    label="1 page layout"
                    caption="Best for shorter articles and FAQs - shows all articles on a single page in an accordion layout."
                    onClick={() => onLayoutChange(HelpCenterLayout.ONEPAGER)}
                    name="layout"
                    isDisabled={isOnePagerDisabled}
                    preview={<img src={image1PageLayout} alt="1-page layout" />}
                />
                <PreviewRadioButton
                    isSelected={selectedLayout === HelpCenterLayout.DEFAULT}
                    value={HelpCenterLayout.DEFAULT}
                    label="Card layout"
                    caption="Best for more complex Help Centers - organize content into categories and sub-categories."
                    onClick={() => onLayoutChange(HelpCenterLayout.DEFAULT)}
                    name="layout"
                    preview={<img src={imageCardLayout} alt="card layout" />}
                />
            </div>
            {isOnePagerDisabled && (
                <Caption>
                    1-page layouts don’t support multiple levels of categories.
                    Move all categories to the top level to switch your help
                    center layout.
                </Caption>
            )}
        </div>
    )
}
