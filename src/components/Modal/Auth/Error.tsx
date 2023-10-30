import { authModalState } from "../../../atoms/authModalAtom";
import { Flex, Text } from "@chakra-ui/react";
import { useRecoilState } from "recoil";

function Error() {
  const [modalState, setModalState] = useRecoilState(authModalState);
  const FIREBASE_ERRORS = {
    "Firebase: Error (auth/email-already-in-use).": (
      <>
        <Text textAlign={"center"} color="red" fontSize={"10pt"}>
          A user with that email already exists
          <Text
            color="red"
            fontSize={"10pt"}
            as="u"
            cursor={"pointer"}
            _hover={{ color: "red.700" }}
            onClick={() =>
              setModalState((prev) => ({ ...prev, view: "login" }))
            }
          >
            <br />
            Are you alredy a redditor?
          </Text>
        </Text>
      </>
    ),
    "Firebase: Error (auth/user-not-found).": (
      <>
        <Flex justifyContent={"space-between"}>
          <Text textAlign={"center"} color="red" fontSize={"10pt"}>
            Email not found...
          </Text>
          <Text
            textAlign={"center"}
            color="red"
            fontSize={"10pt"}
            as="u"
            cursor={"pointer"}
            _hover={{ color: "red.700" }}
            onClick={() =>
              setModalState((prev) => ({ ...prev, view: "signup" }))
            }
          >
            Did you signed up first?
          </Text>
        </Flex>
      </>
    ),
    "Firebase: Error (auth/wrong-password).": (
      <Text textAlign={"center"} color="red" fontSize={"10pt"}>
        Wrong password!
      </Text>
    ),

    "Firebase: Password should be at least 6 characters (auth/weak-password).":
      (
        <Text textAlign={"center"} color="red" fontSize={"10pt"}>
          Password should be at least 6 characters!
        </Text>
      ),
  };
  if (
    FIREBASE_ERRORS[modalState.error as keyof typeof FIREBASE_ERRORS] ===
    undefined
  )
    return (
      <Text textAlign={"center"} color="red" fontSize={"10pt"}>
        {modalState.error}
      </Text>
    );
  return FIREBASE_ERRORS[modalState.error as keyof typeof FIREBASE_ERRORS];
}

export default Error;
