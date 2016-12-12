import * as  latinize_ from 'latinize'

export class LangHelper {

    latinize(word: string): string {
        return latinize_(word)
    }

    getWordVariations(word: string): string[] {
        return [word]
    }
}
