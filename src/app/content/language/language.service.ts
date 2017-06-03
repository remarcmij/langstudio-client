import { Injectable } from '@angular/core'

import { LangHelper } from './lang-helper'
import { LangHelperID } from './lang-helper-id'
import { LangHelperNL } from './lang-helper-nl'
import { config } from '../../app.config'

@Injectable()
export class LanguageService {

  baseLang = config.defaults.baseLang
  targetLang = config.defaults.targetLang

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
    switch (lang.slice(0, 2)) {
      case 'id':
        return new LangHelperID()
      case 'nl':
        return new LangHelperNL()
      default:
        return new LangHelper()
    }
  }
}
