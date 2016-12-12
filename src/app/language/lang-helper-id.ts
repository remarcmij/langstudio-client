import { LangHelper } from './lang-helper'
import * as uniq from 'lodash.uniq'

const WordExemptions: string[] = [
    'aku',
    'ilmu',
    'kamu',
    'tamu',
    'temu',
    'dia',
    'bukan',
    'ini'
]

export class LangHelperID extends LangHelper {

    getWordVariations(word: string): string[] {
        let variations: string[] = []
        let mePrefixed = false
        this.getVariations(word, variations, mePrefixed)
        return uniq(variations)
    }

    private getVariations(word: string, variations: string[], mePrefixed: boolean): void {
        let match: RegExpMatchArray
        let meWord: string

        variations.push(word)

        if (WordExemptions.indexOf(word) !== -1) {
            return
        }

        // strip suffix
        match = word.match(/^(.{2,})nya$/)
        if (match) {
            word = match[1]
            this.getVariations(match[1], variations, mePrefixed)
        }

        // strip ku and mu suffix
        match = word.match(/^(.{2,})(?:ku|kau|mu)$/)
        if (match) {
            this.getVariations(match[1], variations, mePrefixed)
        }

        // strip mu prefix
        match = word.match(/^mu(.{2,})$/)
        if (match) {
            this.getVariations(match[1], variations, mePrefixed)
        }

        // strip ku and kau prefix
        match = word.match(/^(?:ku|kau)(.{2,})$/)
        if (match) {
            this.getVariations(match[1], variations, mePrefixed)
        }

        // strip di prefix and replace with me prefix
        match = word.match(/^(?:di)(.{2,})$/)
        if (match && !mePrefixed) {
            let matchWord = match[1]
            if (!mePrefixed) {
                meWord = this.prefixWithMeng(matchWord)
                mePrefixed = true
                if (meWord !== matchWord) {
                    this.getVariations(meWord, variations, mePrefixed)
                }
            }
            // if word start with per- add mem prefix
            match = matchWord.match(/^per|pelajar/)
            if (match && !mePrefixed) {
                mePrefixed = true
                this.getVariations('mem' + matchWord, variations, mePrefixed)
            }
        }

        // strip suffix
        match = word.match(/^(.{2,})(?:[klt]ah|pun)$/)
        if (match) {
            this.getVariations(match[1], variations, mePrefixed)
        }

        // ter strip prefix
        match = word.match(/^(?:ter)(.{2,})$/)
        if (match) {
            this.getVariations(match[1], variations, mePrefixed)
        }

        // if word ends with '-kan' or '-i' and doesn't start with m, add meng prefix
        match = word.match(/^[^m].{2,}(kan|i)$/)
        if (match && !mePrefixed) {
            meWord = this.prefixWithMeng(word)
            mePrefixed = true
            if (meWord !== word) {
                this.getVariations(meWord, variations, mePrefixed)
            }
        }

        // se strip prefix
        match = word.match(/^(?:se)(.{2,})$/)
        if (match) {
            this.getVariations(match[1], variations, mePrefixed)
        }

        // if word starts with 'per-' add mem prefix
        match = word.match(/^per|pelajar/)
        if (match && !mePrefixed) {
            mePrefixed = true
            this.getVariations('mem' + word, variations, mePrefixed)
        }

        // strip reduplication
        match = word.match(/^(.{2,})(?:-.{2,})$/)
        if (match) {
            this.getVariations(match[1], variations, mePrefixed)
        }
    }

    private prefixWithMeng(word: string): string {
        if (word.match(/^[aeiou]/)) {
            word = 'meng' + word
        } else if (word.match(/^[bf]/)) {
            word = 'mem' + word
        } else if (word.match(/^p/)) {
            // initial 'p' is lost
            if (!word.match(/^per|pelajar/)) {
                word = word.substring(1)
            }
            word = 'mem' + word
        } else if (word.match(/^(?:d|t|c|j|sy|z)/)) {
            if (word.match(/^t/)) {
                // initial 't' is lost
                word = word.substring(1)
            }
            word = 'men' + word
        } else if (word.match(/^s/)) {
            // initial 's' is lost
            word = 'meny' + word.substring(1)
        } else if (word.match(/^(?:g|h|k|kh)/)) {
            if (word.match(/^k[^h]/)) {
                // initial 'k' is lost
                word = word.substring(1)
            }
            word = 'meng' + word
        } else if (word.match(/^(?:l|r|m|n|ny|ng|w|y)/)) {
            word = 'me' + word
        }
        return word
    }
}
