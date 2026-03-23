import type { RuleDraft } from '../rule/types'
import type { TagDraft } from '../tag/types'
import type { ViewDraft } from '../view/types'

export enum RuleRecipeTag {
    AUTO_CLOSE = 'Auto Close',
    AUTO_OPEN = 'Auto Open',
    AUTO_TAG = 'Auto Tag',
    AUTO_REPLY = 'Auto Reply',
    PRIORITY = 'Priority',
}

export type RuleRecipe = {
    slug: string
    rule: RuleDraft
    tags: TagDraft[]
    views_per_section: { [section: string]: ViewDraft[] }
    triggered_count: number
    recipe_tag: string
    type?: string
}
