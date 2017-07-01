export class Article {
    fileName: string
    groupName: string
    title: string
    targetLang?: string
    baseLang?: string
    mdText: string
    htmlText: string
    indexText?: string
    _topic?: any
}

export interface AnchorInfo {
    tag: string
    title: string
    name: string
}

export class HashTagItem {
    title: string
    subtitle: string
    pubTitle: string
    publication: string
    chapter: string
    active?: boolean
}
