import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Post } from "../../../../atoms/postsAtom";
import Comments from "../../../../components/comments/Comments";
import About from "../../../../components/community/About";
import PageContent from "../../../../components/Layout/PageContent";
import PostItem from "../../../../components/Posts/PostItem";
import { auth, firestore } from "../../../../firebase/clientApp";
import useCommunityData from "../../../../hooks/useCommunityData";
import usePosts from "../../../../hooks/usePosts";

function PostPage() {
  const { postStateValue, setPostStateValue, onDeletePost, onVote } =
    usePosts();
  const { communityStateValue } = useCommunityData();
  const router = useRouter();
  const [user] = useAuthState(auth);
  async function fetchPost(postId: string) {
    try {
      const postDocRef = doc(firestore, "posts", postId);
      const postDoc = await getDoc(postDocRef);
      setPostStateValue((prev) => ({
        ...prev,
        selectedPost: {
          id: postDoc.id,
          ...postDoc.data(),
        } as Post,
      }));
    } catch (error) {
      console.log("fetchPost error", error);
    }
  }

  useEffect(() => {
    const { pid } = router.query;
    if (pid && !selectedPost) {
      fetchPost(pid as string);
    }
  }, [router.query]);

  const { selectedPost } = postStateValue;

  return (
    <PageContent>
      <>
        {selectedPost && (
          <>
            <PostItem
              post={selectedPost}
              onVote={onVote}
              onDeletePost={onDeletePost}
              userVoteValue={
                postStateValue.postVotes.find(
                  (vote) => vote.postId === selectedPost.id
                )?.voteValue || 0
              }
              userIsCreator={selectedPost.creatorId === user?.uid}
            />
            <Comments
              user={user}
              selectedPost={selectedPost}
              communityId={selectedPost?.communityId as string}
            />
          </>
        )}
      </>
      <>
        {communityStateValue.currentCommunity && (
          <About communityData={communityStateValue.currentCommunity} />
        )}
      </>
    </PageContent>
  );
}

export default PostPage;
