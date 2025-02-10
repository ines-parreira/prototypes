import {Task} from '../Task'

export class AlwaysHiddenTask extends Task {
    constructor() {
        super(
            'Always Hidden',
            'This task should never be displayed',
            'BASIC',
            {} as any,
            {} as any
        )
    }

    protected shouldBeDisplayed(): boolean {
        return true
    }

    protected getFeatureUrl(): string {
        return '/'
    }
}
