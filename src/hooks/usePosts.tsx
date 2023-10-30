import { log } from "console";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { relativeTimeRounding } from "moment";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { authModalState } from "../atoms/authModalAtom";
import { communityState } from "../atoms/communityAtom";
import { Post, postState, PostVote } from "../atoms/postsAtom";
import { auth, firestore, storage } from "../firebase/clientApp";

function usePosts() {
  const router = useRouter();
  const [postStateValue, setPostStateValue] = useRecoilState(postState);
  const setAuthModal = useSetRecoilState(authModalState);
  const currentCommunity = useRecoilValue(communityState).currentCommunity;
  const [user] = useAuthState(auth);

  async function onVote(
    event: React.MouseEvent<SVGElement, MouseEvent>,
    post: Post,
    vote: number,
    communityId: string
  ) {
    event.stopPropagation();
    if (!user) {
      setAuthModal((prev) => ({ ...prev, view: "login", open: true }));
      return;
    }
    try {
      let newPost = { ...post };
      let newPosts = [...postStateValue.posts];
      let newPostVotes = [...postStateValue.postVotes];

      const batch = writeBatch(firestore);

      const existingVote = postStateValue.postVotes.find(
        (vote) => vote.postId === post.id
      );

      if (!existingVote) {
        const voteValueRef = doc(
          collection(firestore, "users", `${user?.uid}/postVotes`)
        );

        const newVote: PostVote = {
          communityId: communityId,
          postId: post.id!,
          voteValue: vote,
        };

        // add vote to user in db
        batch.set(voteValueRef, newVote);
        // update db post vote value to "+ vote"

        batch.update(doc(firestore, "posts", post.id!), {
          voteStatus: post.voteStatus + vote,
        });

        // update post instance

        newPost = { ...newPost, voteStatus: newPost.voteStatus + vote };
        // add local votestatus atom

        newVote.id = voteValueRef.id;
        newPostVotes = [...newPostVotes, newVote];
      } else {
        // if the vote is equal to votestatus

        const existingVoteRef = doc(
          firestore,
          `users/${user?.uid}/postVotes`,
          existingVote.id!
        );
        if (vote === existingVote.voteValue) {
          // delete user vote in db
          batch.delete(existingVoteRef);
          // update db post vote value to "- vote"
          batch.update(doc(firestore, "posts", post.id!), {
            voteStatus: post.voteStatus - vote,
          });
          // delete user vote in atom
          newPostVotes = newPostVotes.filter(
            (item) => item.id !== existingVote.id
          );

          // update atom post vote value to "- vote"
          newPost = { ...newPost, voteStatus: newPost.voteStatus - vote };
        }
        // otherwise
        else {
          // change user vote status in db
          batch.update(existingVoteRef, {
            voteValue: vote,
          });

          // change post vote value in db
          batch.update(doc(firestore, "posts", post.id!), {
            voteStatus: post.voteStatus + vote * 2,
          });

          // change atom postVotes status

          const postVoteIdx = newPostVotes.findIndex(
            (item) => item.id === existingVote.id
          );

          newPostVotes[postVoteIdx] = {
            ...newPostVotes[postVoteIdx],
            voteValue: vote,
          };

          // change atom posts vote value

          newPost = {
            ...newPost,
            voteStatus: newPost.voteStatus + vote * 2,
          };
        }
      }
      const postIdx = newPosts.findIndex((item) => item.id === post.id);

      newPosts[postIdx] = newPost;

      setPostStateValue((prev) => ({
        ...prev,
        posts: newPosts,
        postVotes: newPostVotes,
        selectedPost: newPost,
      }));
      if (postStateValue.selectedPost) {
        setPostStateValue((prev) => ({
          ...prev,
          selectedPost: newPost,
        }));
      }

      await batch.commit();
    } catch (error) {
      console.log("onvote error", error);
    }
  }

  async function onSelectPost(post: Post) {
    setPostStateValue((prev) => ({
      ...prev,
      selectedPost: post,
    }));
    router.push(`/r/${post.communityId}/comments/${post.id}`);
  }

  async function onDeletePost(
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    post: Post
  ): Promise<boolean> {
    e.stopPropagation();
    try {
      if (post.imageURL) {
        const imageRef = ref(storage, `posts/${post.id}/image`);
        await deleteObject(imageRef);
      }
      const postDocRef = doc(firestore, "posts", post.id!);
      await deleteDoc(postDocRef);

      setPostStateValue((prev) => ({
        ...prev,
        posts: prev.posts.filter((item) => item.id !== post.id),
      }));
      return true;
    } catch (error) {
      return false;
    }
  }

  async function getCommunityPostVote(communtiyId: string) {
    try {
      const postQuery = query(
        collection(firestore, `users/${user?.uid}/postVotes`),
        where("communityId", "==", communtiyId)
      );
      const postDocs = await getDocs(postQuery);
      const postVotes = postDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log(postVotes);
      setPostStateValue((prev) => ({
        ...prev,
        postVotes: postVotes as PostVote[],
      }));
    } catch (error: any) {
      console.log("getPost error", error.message);
    }
  }

  useEffect(() => {
    if (!user) {
      setPostStateValue((prev) => ({ ...prev, postVotes: [] }));
      return;
    }
    if (currentCommunity?.id) getCommunityPostVote(currentCommunity.id);
  }, [currentCommunity, user]);

  return {
    postStateValue,
    setPostStateValue,
    onVote,
    onSelectPost,
    onDeletePost,
  };
}

export default usePosts;
