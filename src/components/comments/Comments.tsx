import {
  Box,
  Flex,
  SkeletonCircle,
  SkeletonText,
  Stack,
  Text,
} from "@chakra-ui/react";
import { User } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  increment,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import { authModalState } from "../../atoms/authModalAtom";
import { Post, postState } from "../../atoms/postsAtom";
import { firestore } from "../../firebase/clientApp";
import CommentInput from "./CommentInput";
import type { Comment } from "./CommentItem";
import CommentItem from "./CommentItem";

export type CommentVote = {
  id?: string;
  voteValue: -1 | 1;
  commentId: string;
  postId: string;
};

type Props = {
  user?: User | null;
  selectedPost: Post;
  communityId: string;
};

function Comments({ user, selectedPost, communityId }: Props) {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);

  const [commentsVotes, setCommentsVotes] = useState<CommentVote[]>([]);

  const [fetchLoading, setFetchLoading] = useState(true);
  const [deletingComment, setDeletingComment] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const setPostState = useSetRecoilState(postState);

  const setAuthModal = useSetRecoilState(authModalState);

  async function onCreateComment() {
    setCreateLoading(true);
    try {
      const batch = writeBatch(firestore);

      const commentDocRef = doc(collection(firestore, "comments"));

      const newComment: Comment = {
        id: commentDocRef.id,
        creatorId: user!.uid,
        creatorDisplayText: user!.email!.split("@")[0],
        communityId,
        postId: selectedPost!.id!,
        postTitle: selectedPost?.title!,
        text: commentText,
        createdAt: serverTimestamp() as Timestamp,
        voteStatus: 0,
      };

      batch.set(commentDocRef, newComment);

      newComment.createdAt = { seconds: Date.now() / 1000 } as Timestamp;

      const postDocRef = doc(firestore, "posts", selectedPost?.id!);
      batch.update(postDocRef, {
        numberOfComments: increment(1),
      });
      await batch.commit();

      setCommentText("");
      setComments((prev) => [newComment, ...prev]);

      setPostState((prev) => ({
        ...prev,
        selectedPost: {
          ...prev.selectedPost,
          numberOfComments: prev.selectedPost!.numberOfComments + 1,
        } as Post,
      }));
    } catch (error) {}
    setCreateLoading(false);
  }

  async function onVote(comment: Comment, vote: 1 | -1) {
    if (!user) {
      setAuthModal((prev) => ({ ...prev, view: "login", open: true }));
      return;
    }
    try {
      let newComment = { ...comment };
      let newComments = [...comments];
      let newCommentVotes = [...commentsVotes];

      const batch = writeBatch(firestore);

      const existingVote = commentsVotes.find(
        (vote) => vote.commentId === comment.id
      );

      if (!existingVote) {
        const voteValueRef = doc(
          collection(firestore, "users", `${user?.uid}/commentVotes`)
        );

        const newVote: CommentVote = {
          id: voteValueRef.id,
          postId: selectedPost.id!,
          commentId: comment.id!,
          voteValue: vote,
        };

        // add vote to user in db
        batch.set(voteValueRef, newVote);
        // update db post vote value to "+ vote"

        batch.update(doc(firestore, "comments", comment.id!), {
          voteStatus: comment.voteStatus + vote,
        });

        // update post instance

        newComment = {
          ...newComment,
          voteStatus: newComment.voteStatus + vote,
        };
        // add local votestatus atom

        newVote.id = voteValueRef.id;

        newCommentVotes = [...newCommentVotes, newVote];
      } else {
        // if the vote is equal to votestatus
        const existingVoteRef = doc(
          firestore,
          `users/${user?.uid}/commentVotes`,
          existingVote.id!
        );

        if (vote === existingVote.voteValue) {
          // delete user vote in db
          batch.delete(existingVoteRef);
          // update db post vote value to "- vote"
          batch.update(doc(firestore, "comments", comment.id!), {
            voteStatus: comment.voteStatus - vote,
          });
          // delete user vote in atom
          newCommentVotes = newCommentVotes.filter(
            (item) => item.id !== existingVote.id
          );

          // update atom post vote value to "- vote"
          newComment = {
            ...newComment,
            voteStatus: newComment.voteStatus - vote,
          };
        }
        // otherwise
        else {
          // change user vote status in db
          batch.update(existingVoteRef, {
            voteValue: vote,
          });

          // change post vote value in db
          batch.update(doc(firestore, "comments", comment.id!), {
            voteStatus: newComment.voteStatus + vote * 2,
          });

          // change atom postVotes status

          const postVoteIdx = newCommentVotes.findIndex(
            (item) => item.id === existingVote.id
          );

          newCommentVotes[postVoteIdx] = {
            ...newCommentVotes[postVoteIdx],
            voteValue: vote,
          };

          // change atom posts vote value

          newComment = {
            ...newComment,
            voteStatus: newComment.voteStatus + vote * 2,
          };
        }
      }
      const commentIdx = newComments.findIndex(
        (item) => item.id === comment.id
      );

      newComments[commentIdx] = newComment;

      setComments(newComments);
      setCommentsVotes(newCommentVotes);

      await batch.commit();
    } catch (error) {
      console.log("onvote error", error);
    }
  }

  async function onDeleteComment(comment: Comment) {
    setDeletingComment(comment.id);
    try {
      const batch = writeBatch(firestore);

      const commentDocRef = doc(firestore, "comments", comment.id);
      batch.delete(commentDocRef);

      const postDocRef = doc(firestore, "posts", comment.postId);
      batch.update(postDocRef, { numberOfComments: increment(-1) });

      await batch.commit();

      setComments((prev) => prev.filter((item) => item.id !== comment.id));

      setPostState((prev) => ({
        ...prev,
        selectedPost: {
          ...prev.selectedPost,
          numberOfComments: prev.selectedPost!.numberOfComments - 1,
        } as Post,
      }));
    } catch (error) {
      console.log("onDeleteComment error", error);
    }
    setDeletingComment("");
  }

  async function getPostComments() {
    try {
      const commentsQuery = query(
        collection(firestore, "comments"),
        where("postId", "==", selectedPost.id),
        orderBy("createdAt", "desc")
      );
      const commentsDocs = await getDocs(commentsQuery);
      const comments = commentsDocs.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));
      setComments(comments as Comment[]);
    } catch (error) {
      console.log();
    }
    setFetchLoading(false);
  }

  async function getCommentsVotes() {
    try {
      const commentVotesQuery = query(
        collection(firestore, "users", `${user?.uid}/commentVotes`),
        where("postId", "==", selectedPost.id)
      );
      const commentVotesDocs = await getDocs(commentVotesQuery);
      const commentVotes = commentVotesDocs.docs.map(
        (item) =>
          ({
            id: item.id,
            ...item.data(),
          } as CommentVote)
      );
      setCommentsVotes(commentVotes);
    } catch (error) {
      console.log("getCommentsVotes error", error);
    }
  }

  useEffect(() => {
    getPostComments();
    getCommentsVotes();
  }, []);

  return (
    <Box bg="white" borderRadius="0px 0px 4px 4px" p={2}>
      {!fetchLoading && (
        <Flex
          direction="column"
          pl={10}
          pr={4}
          mb={6}
          fontSize="10pt"
          width="100%"
        >
          <CommentInput
            commentText={commentText}
            setCommentText={setCommentText}
            user={user}
            createLoading={createLoading}
            onCreateComment={onCreateComment}
          />
        </Flex>
      )}
      {fetchLoading ? (
        <>
          {[0, 1, 2].map((item) => (
            <Box key={item} padding="6" bg="white">
              <SkeletonCircle size="10" />
              <SkeletonText mt="4" noOfLines={2} spacing="4" />
            </Box>
          ))}
        </>
      ) : (
        <>
          {!!comments.length ? (
            <>
              <Stack spacing={6} p={2}>
                {comments.map((comment) => (
                  <CommentItem
                    voteValue={
                      commentsVotes.find(
                        (item) => item.commentId === comment.id
                      )?.voteValue || 0
                    }
                    onVote={onVote}
                    key={comment.id}
                    comment={comment}
                    onDeleteComment={onDeleteComment}
                    loadingDelete={comment.id === deletingComment}
                    userId={user?.uid}
                  />
                ))}
              </Stack>
            </>
          ) : (
            <Flex
              direction="column"
              justify="center"
              align="center"
              borderTop="1px solid"
              borderColor="gray.100"
              p={20}
            >
              <Text fontWeight={700} opacity={0.3}>
                No Comments Yet
              </Text>
            </Flex>
          )}
        </>
      )}
    </Box>
  );
}

export default Comments;
