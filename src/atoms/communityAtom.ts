import { Timestamp } from "firebase/firestore";
import { atom } from "recoil";

export interface Community {
  id?: string;
  creatorId: string;
  numberOfMembers: number;
  privacyType: "public" | "restricted" | "private";
  createdAt: Timestamp;
  imageURL?: string;
}

export interface communitySnippet {
  communityId: string;
  isModerator?: boolean;
  imageURL?: string;
}

interface CommunityState {
  mySnippets: communitySnippet[];
  currentCommunity?: Community;
  snippetsFetched: boolean;
}

export const communityState = atom<CommunityState>({
  key: "communtiesState",
  default: { mySnippets: [], snippetsFetched: false },
});
