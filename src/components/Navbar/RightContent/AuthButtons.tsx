import { Button } from "@chakra-ui/react";
import React from "react";
import { useSetRecoilState } from "recoil";
import { authModalState } from "../../../atoms/authModalAtom";

const AuthButtons: React.FC = () => {
  const setModalState = useSetRecoilState(authModalState);
  return (
    <>
      <Button
        height={"28px"}
        variant="outline"
        display={{ base: "none", sm: "flex" }}
        width={{ base: "70px", md: "110px" }}
        mr={2}
        onClick={() =>
          setModalState((prev) => ({ ...prev, open: true, view: "login" }))
        }
      >
        Log In
      </Button>
      <Button
        height={"28px"}
        variant="solid"
        display={{ base: "none", sm: "flex" }}
        width={{ base: "70px", md: "110px" }}
        mr={2}
        onClick={() =>
          setModalState((prev) => ({ ...prev, open: true, view: "signup" }))
        }
      >
        Sign Up
      </Button>
    </>
  );
};
export default AuthButtons;
