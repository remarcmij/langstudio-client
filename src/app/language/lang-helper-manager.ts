import { Injectable } from '@angular/core'

import { LangHelper } from './lang-helper'
import { LangHelperID } from './lang-helper-id'
import { LangHelperNL } from './lang-helper-nl'

@Injectable()
export class LanguageManager {

    private helpers = new Map<string, LangHelper>()

    getLangHelper(lang: string): LangHelper {
        let helper = this.helpers.get(lang)
        if (!helper) {
            helper = this.createLangHelper(lang)
            this.helpers.set(lang, helper)
        }
        return helper
    }

    private createLangHelper(lang: string): LangHelper {
        switch (lang) {
            case 'id':
                return new LangHelperID()

            case 'nl':
                return new LangHelperNL()

            default:
                return new LangHelper()
        }
    }
}
