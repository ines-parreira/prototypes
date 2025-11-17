import type { RuleRecipe } from 'models/ruleRecipe/types'
import { RuleRecipeTag } from 'models/ruleRecipe/types'
import type { TagDraft } from 'models/tag/types'
import type { ViewDraft } from 'models/view/types'
import type { RuleDraft } from 'state/rules/types'

import { emptyRule } from './rule'
import { tags } from './tag'
import { view } from './views'

export const emptyRuleRecipeFixture: RuleRecipe = {
    slug: 'rule-recipe-fixture',
    recipe_tag: RuleRecipeTag.AUTO_TAG,
    rule: emptyRule as RuleDraft,
    views_per_section: { ['none']: [view as ViewDraft] },
    tags: tags as TagDraft[],
    triggered_count: 0,
}
export const emptyRuleRecipeFixtureWithSections: RuleRecipe = {
    slug: 'rule-recipe-fixture',
    recipe_tag: RuleRecipeTag.AUTO_TAG,
    rule: emptyRule as RuleDraft,
    views_per_section: { fooSection: [view as ViewDraft] },
    tags: tags as TagDraft[],
    triggered_count: 0,
}
