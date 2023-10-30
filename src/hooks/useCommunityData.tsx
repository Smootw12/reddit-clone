import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { authModalState } from "../atoms/authModalAtom";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  Community,
  communityState,
  communitySnippet,
} from "../atoms/communityAtom";
import { auth, firestore } from "../firebase/clientApp";
import { useRouter } from "next/router";

function useCommunityData() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [communityStateValue, setCommunityStateValue] =
    useRecoilState(communityState);

  const setAuthModalState = useSetRecoilState(authModalState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function onJoinOrLeaveCommunity(communityData: Community, isJoined: boolean) {
    // is the user signed in?
    // if not => open auth modal
    if (!user) {
      setAuthModalState((prev) => ({
        ...prev,
        open: true,
        view: "login",
      }));
      return;
    }

    if (isJoined) {
      leaveCommunity(communityData);
      return;
    }
    joinCommunity(communityData);
  }

  async function getMySnippets() {
    setLoading(true);
    try {
      const snippetDocs = await getDocs(
        collection(firestore, `users/${user?.uid}/communitySnippets`)
      );
      const snippets = snippetDocs.docs.map((doc) => ({
        ...doc.data(),
        communityId: doc.id,
      }));
      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: snippets as [communitySnippet],
        snippetsFetched: true,
      }));
    } catch (error: any) {
      console.log(error);
      setError(error);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!user) {
      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: [],
        snippetsFetched: false,
      }));
    }
    getMySnippets();
  }, [user]);

  async function joinCommunity(communityData: Community) {
    setLoading(true);
    try {
      const batch = writeBatch(firestore);
      const newSnippet: communitySnippet = {
        communityId: communityData.id!,
        imageURL: communityData.imageURL || "",
        isModerator: user?.uid === communityData.creatorId,
      };
      batch.set(
        doc(
          firestore,
          `users/${user?.uid}/communitySnippets`,
          communityData.id!
        ),
        newSnippet
      );
      batch.update(doc(firestore, `communities/${communityData.id}`), {
        numberOfMembers: increment(1),
      });

      await batch.commit();

      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: [...prev.mySnippets, newSnippet],
      }));
    } catch (error: any) {
      console.log(error);
      setError(error);
    }
    setLoading(false);
  }

  async function leaveCommunity(communityData: Community) {
    setLoading(true);
    try {
      const batch = writeBatch(firestore);
      batch.delete(
        doc(
          firestore,
          `users/${user?.uid}/communitySnippets`,
          communityData.id!
        )
      );
      batch.update(doc(firestore, `communities/${communityData.id}`), {
        numberOfMembers: increment(-1),
      });

      await batch.commit();

      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: prev.mySnippets.filter(
          (item) => item.communityId !== communityData.id
        ),
      }));
    } catch (error: any) {
      console.log("leaveCommunity error", error);
    }
    setLoading(false);
  }

  async function getCommuntiyData(communityId: string) {
    try {
      const communityDocRef = doc(firestore, "communities", communityId);
      const communityDoc = await getDoc(communityDocRef);

      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: {
          id: communityDoc.id,
          ...communityDoc.data(),
        } as Community,
      }));
    } catch (error) {
      console.log("getCommunityData", error);
    }
  }

  useEffect(() => {
    const { communityId } = router.query;
    if (communityId && !communityStateValue.currentCommunity) {
      getCommuntiyData(communityId as string);
    }
  }, [router.query]);

  return {
    error,
    communityStateValue,
    onJoinOrLeaveCommunity,
    loading,
  };
}

export default useCommunityData;
