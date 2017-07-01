export interface HomonymGroup {
  base: string
  baseLang: string
  homonym: number
  lemmas: Lemma[]
}

export interface DictResult {
  bases: string[]
  baseMap: { [key: string]: HomonymGroup }
}

export class Lemma {
  _id: string
  word: string
  lang: string
  attr: string
  base: string
  baseLang: string
  text: string
  order: number
  homonym: number
  groupName: string

  static makeSearchResult(lemmas: Lemma[]): DictResult {
    const result: DictResult = {
      bases: [],
      baseMap: {}
    }
    return lemmas.reduce((acc, lemma) => {
      const key = `${lemma.base}`
      if (key in acc.baseMap) {
        acc.baseMap[key].lemmas.push(lemma)
      } else {
        acc.bases.push(key)
        acc.baseMap[key] = {
          base: lemma.base,
          baseLang: lemma.baseLang,
          lemmas: [lemma],
          homonym: lemma.homonym
        }
      }
      return acc
    }, result)
  }
}
