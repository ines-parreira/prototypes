import {RuleEngineDataContext, RuleEngineRoutesContext} from '../ruleEngine'

export abstract class Task {
    public display: boolean
    public featureUrl: string

    constructor(
        public title: string,
        public caption: string,
        public type: 'BASIC' | 'RECOMMENDED',
        protected data: RuleEngineDataContext,
        protected routes: RuleEngineRoutesContext
    ) {
        this.display = this.shouldBeDisplayed(data)
        this.featureUrl = this.getFeatureUrl(data, routes)
    }

    protected abstract shouldBeDisplayed(data: RuleEngineDataContext): boolean
    protected abstract getFeatureUrl(
        data: RuleEngineDataContext,
        routes: RuleEngineRoutesContext
    ): string
}
