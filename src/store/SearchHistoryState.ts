import { RecoilAtomKeys, RecoilSelectorKeys } from './RecoilKeys';
import { atom, selector, selectorFamily, useRecoilCallback, useRecoilValue } from "recoil";

type SearchHistoryItem = {
    word: string;
    timestamp: number;
}

type SearchHistoryState = {
    past: SearchHistoryItem[][];
    present: SearchHistoryItem[];
    future: SearchHistoryItem[][];
}

type SearchHistoryActions = {
    useAddSearchHistory: () => (word: string) => void;
    useUndoSearchHistory: () => () => void;
    useRedoSearchHistory: () => () => void;
}

type SearchHistorySelectors = {
    useSearchHistory: () => SearchHistoryItem[];
    useSearchHistoryAt: (timestamp: number) => SearchHistoryItem | undefined;
}

const searchHistoryState = atom<SearchHistoryState>({
    key: RecoilAtomKeys.SEARCH_HISTORY_STATE,
    default: {
        past: [],
        present: [{
            word: 'init',
            timestamp: 0
        }],
        future: []
    }
});

const searchHistorySelector = selector<SearchHistoryItem[]>({
    key: RecoilSelectorKeys.SEARCH_HISTORY_PRESENT,
    get: ({ get }) => get(searchHistoryState).present
});

const searchHistoryItemSelector = selectorFamily<SearchHistoryItem | undefined, number>({
    key: RecoilSelectorKeys.SEARCH_HISTORY_ITEM,
    get: (timestamp: number) => ({ get }) => get(searchHistoryState).present.find(item => item.timestamp === timestamp)
});

export const searchHistorySelectors: SearchHistorySelectors = {
    useSearchHistory: () => useRecoilValue(searchHistorySelector),
    useSearchHistoryAt: (timestamp: number) => useRecoilValue(searchHistoryItemSelector(timestamp))
}

export const searchHistoryActions: SearchHistoryActions = {
    useAddSearchHistory: () => useRecoilCallback(({ set }) => (word: string) => {
        set(searchHistoryState, ({ past, present }) => {
            return {
                past: [...past, [...present]],
                present: [...present, {
                    word,
                    timestamp: Date.now()
                }],
                future: []
            };
        });
    }),

    useUndoSearchHistory: () => useRecoilCallback(({ set }) => () => {
        set(searchHistoryState, ({ past, present, future }) => {
            if (past.length === 0) {
                return {
                    past: [],
                    present: [...present],
                    future: [...future]
                };
            }

            return {
                past: [...past.slice(0, past.length - 1)],
                present: [...past[past.length - 1]],
                future: [[...present] ,...future]
            };
        });
    }),

    useRedoSearchHistory: () => useRecoilCallback(({ set }) => () => {
        set(searchHistoryState, ({ past, present, future }) => {
            if (future.length === 0) {
                return {
                    past: [...past],
                    present: [...present],
                    future: []
                };
            }

            return {
                past: [...past, [...present]],
                present: [...future[0]],
                future: [...future.slice(1)]
            };
        })
    })
}