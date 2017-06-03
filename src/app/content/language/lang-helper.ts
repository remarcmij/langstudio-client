import * as  latinize from 'latinize'

export class LangHelper {

  latinize(word: string): string {
    return latinize(word)
  }

  getWordVariations(word: string): string[] {
    return [word]
  }
}
