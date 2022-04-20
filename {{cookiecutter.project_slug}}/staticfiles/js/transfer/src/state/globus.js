import { atom } from 'recoil';

export const CurrentPortalDirectoryAtom = atom({
  key: 'CurrentPortalDirectory',
  default: '/~/'
})

export const CurrentSearchDirectoryAtom = atom({
  key: 'CurrentSearchDirectory',
  default: '/~/'
})

export const SearchEndpointAtom = atom({
  key: 'SearchEndpointAtom',
  default: null
})

export const PortalCollectionAtom = atom({
  key: 'PortalCollectionAtom',
  default: { 'DATA': [] }
});

export const SearchCollectionAtom = atom({
  key: 'SearchCollectionAtom',
  default: { 'DATA': [] }
});

export const SelectedPortalItemsAtom = atom({
  key: 'SelectedPortalAtom',
  default: []
})

export const SelectedSearchItemsAtom = atom({
  key: 'SelectedSearchItemsAtom',
  default: []
});