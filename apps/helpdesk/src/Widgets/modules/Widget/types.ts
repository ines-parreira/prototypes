import type { Source, Template } from 'models/widget/types'

export type WidgetProps = {
    template: Template | null
    source?: Source
}
