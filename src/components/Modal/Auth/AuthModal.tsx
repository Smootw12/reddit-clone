import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Flex,
  Text,
  Button,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useRecoilState } from "recoil";
import { authModalState } from "../../../atoms/authModalAtom";
import AuthInputs from "./AuthInputs";
import OAuthButtons from "./OAuthButtons";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase/clientApp";
import ResetPassword from "./ResetPassword";

const AuthModal: React.FC = () => {
  const [user, loading, error] = useAuthState(auth);
  const [modalState, setModalState] = useRecoilState(authModalState);

  function handleClose() {
    setModalState((prev) => ({ ...prev, open: false }));
  }

  useEffect(() => {
    if (user) handleClose();
  }, [user]);

  return (
    <>
      <Modal isOpen={modalState.open} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign={"center"}>
            {modalState.view === "login" && "Login"}
            {modalState.view === "signup" && "Sign Up"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            padding="10"
          >
            <Flex
              direction="column"
              align={"center"}
              justify="center"
              width={"70%"}
            >
              {modalState.view === "resetPassword" ? (
                <ResetPassword />
              ) : (
                <div>
                  {" "}
                  <OAuthButtons />
                  <Text color="gray.500" fontWeight={700} textAlign="center">
                    OR
                  </Text>
                  <AuthInputs />{" "}
                </div>
              )}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
export default AuthModal;
