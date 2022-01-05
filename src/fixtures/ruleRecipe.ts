import {RuleRecipe, RuleRecipeTag} from '../models/ruleRecipe/types'
import {RuleDraft} from '../state/rules/types'
import {TagDraft} from '../state/tags/types'
import {ViewDraft} from '../models/view/types'

import {emptyRule} from './rule'
import {view} from './views'
import {tags} from './tag'

export const emptyRuleRecipeFixture: RuleRecipe = {
    slug: 'rule-recipe-fixture',
    recipe_tag: RuleRecipeTag.AUTO_TAG,
    rule: emptyRule as RuleDraft,
    views_per_section: {['none']: [view as ViewDraft]},
    tags: tags as TagDraft[],
    triggered_count: 0,
}
export const emptyRuleRecipeFixtureWithSections: RuleRecipe = {
    slug: 'rule-recipe-fixture',
    recipe_tag: RuleRecipeTag.AUTO_TAG,
    rule: emptyRule as RuleDraft,
    views_per_section: {fooSection: [view as ViewDraft]},
    tags: tags as TagDraft[],
    triggered_count: 0,
}
