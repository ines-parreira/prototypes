import {RuleDraft} from '../rule/types'
import {TagDraft} from '../tag/types'
import {ViewDraft} from '../view/types'

export enum RuleRecipeTag {
    AUTO_CLOSE = 'Auto Close',
    AUTO_TAG = 'Auto Tag',
}

export type RuleRecipe = {
    slug: string
    rule: RuleDraft
    tags: TagDraft[]
    views_per_section: {[section: string]: ViewDraft[]}
    triggered_count: number
    recipe_tag: string
}
