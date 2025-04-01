import type { ComponentProps } from 'react'

import { PanelGroup } from 'core/layout/panels'

import css from './ContentPanels.less'

type Props = ComponentProps<typeof PanelGroup>

export function ContentPanels(props: Props) {
    return <PanelGroup {...props} className={css.contentPanels} />
}
