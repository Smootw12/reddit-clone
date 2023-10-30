import { Button, Flex, Image, Text } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { auth, firestore } from "../../../firebase/clientApp";
import { useSignInWithGoogle } from "react-firebase-hooks/auth";
import { authModalState } from "../../../atoms/authModalAtom";
import { useRecoilState } from "recoil";
import { User } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

function OAuthButtons() {
  const [signInWithGoogle, userCred, loading, error] =
    useSignInWithGoogle(auth);
  const [modalState, setModalState] = useRecoilState(authModalState);
  useEffect(() => {
    setModalState((prev) => ({ ...prev, error: error?.message }));
  }, [error?.message]);

  async function createUserDocument(user: User) {
    const userDocRef = doc(firestore, "users", user.uid);
    await setDoc(userDocRef, JSON.parse(JSON.stringify(user)));
  }

  useEffect(() => {
    if (userCred) createUserDocument(userCred.user);
  }, [userCred]);

  return (
    <Flex direction="column" width="100%" mb={4}>
      <Button
        variant="oauth"
        mb={2}
        isLoading={loading}
        onClick={() => signInWithGoogle()}
      >
        <Image src="/images/googlelogo.png" height={"20px"} mr={4} />
        Continue with Google
      </Button>
      <Button variant={"oauth"}>Some other provider</Button>
    </Flex>
  );
}

export default OAuthButtons;
