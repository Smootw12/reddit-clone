import {
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  Icon,
  Input,
  MenuItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
} from "@chakra-ui/react";
import React, { ReactHTMLElement, useState } from "react";
import { GrAdd } from "react-icons/gr";

import { HiLockClosed } from "react-icons/hi";
import { BsFillEyeFill, BsFillPersonFill } from "react-icons/bs";
import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { auth, firestore } from "../../../firebase/clientApp";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import {
  Community,
  communitySnippet,
  communityState,
} from "../../../atoms/communityAtom";
import { useRecoilState, useSetRecoilState } from "recoil";
import useDirectory from "../../../hooks/useDirectory";
import {
  DirectoryMenuItem,
  directoryMenuState,
} from "../../../atoms/directoryMenuAtom";

import { FaReddit } from "react-icons/fa";

type Props = {
  open: boolean;
  handleClose: () => void;
};

function CreateCommunityModal({ open, handleClose }: Props) {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [communityName, setCommunityName] = useState("");
  const [charsRemaining, setCharsRemaining] = useState(21);
  const [communityType, setCommunityType] = useState<
    "public" | "restricted" | "private"
  >("public");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const setCommunityStateValue = useSetRecoilState(communityState);

  const { onSelectMenuItem } = useDirectory();

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.value.length > 21) return;
    setCommunityName(event.target.value);
    setCharsRemaining(21 - event.target.value.length);
  }

  function handleCheckChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCommunityType(e.target.name as "public" | "restricted" | "private");
  }

  function containsSpecialCharacters(str: string, format: string) {
    for (let i = 0; i < str.length; i++) {
      for (let j = 0; j < format.length; j++) {
        if (str[i] === format[j]) {
          return true;
        }
      }
    }
    return false;
  }

  async function handleCreateCommunity() {
    setLoading(true);
    const format = `/^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/`;
    try {
      if (
        containsSpecialCharacters(communityName, format) ||
        communityName.length < 3
      ) {
        throw new Error(
          "Community names must be between 3-21 characters, and can only contain letters, numbers or underscores"
        );
      }
      const communityDocRef = doc(firestore, "communities", communityName);

      await runTransaction(firestore, async (transaction) => {
        const communityDoc = await transaction.get(communityDocRef);

        if (communityDoc.exists()) {
          throw new Error(`sorry, r/${communityName} is taken. Try another.`);
        }

        const newCommunity: Community = {
          creatorId: user?.uid!,
          createdAt: serverTimestamp() as Timestamp,
          numberOfMembers: 1,
          privacyType: communityType,
        };

        transaction.set(communityDocRef, newCommunity);

        const newSnippet: communitySnippet = {
          communityId: communityName,
          isModerator: true,
        };

        transaction.set(
          doc(firestore, `users/${user?.uid}/communitySnippets`, communityName),
          newSnippet
        );

        setCommunityStateValue((prev) => ({
          ...prev,
          currentCommunity: {
            ...newCommunity,
            id: communityName,
          },
          mySnippets: [...prev.mySnippets, newSnippet],
        }));

        onSelectMenuItem({
          displayText: `r/${communityName}`,
          icon: FaReddit,
          iconColor: "brand.100",
          link: `/r/${communityName}`,
        } as DirectoryMenuItem);
        handleClose();
      });
      setError("");
    } catch (error: any) {
      console.log(error);
      setError(error.message);
    }
    setLoading(false);
  }

  return (
    <>
      <Modal isOpen={open} onClose={handleClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            display="flex"
            flexDir="column"
            fontSize={15}
            padding={3}
            mb={2}
          >
            Create a community
          </ModalHeader>
          <Box pl={3} pr={3}>
            <Divider />
            <ModalCloseButton />
            <ModalBody display="flex" flexDir="column" padding="10px 8px">
              <Text fontWeight={600} fontSize={15}>
                Name
              </Text>
              <Text fontSize={11} color="gray.500">
                Community names including capitalization cannot be changed
              </Text>
              <Text
                position="relative"
                top="28px"
                left="10px"
                w="20px"
                color="gray.400"
              >
                r/
              </Text>
              <Input
                value={communityName}
                size="sm"
                pl={"22px"}
                onChange={handleChange}
              />
              <Text
                fontSize="9pt"
                color={charsRemaining === 0 ? "red" : "gray.500"}
              >
                {charsRemaining} Characters remaining
              </Text>
              <Text fontSize="9pt" color="red" pt={1}>
                {error}
              </Text>
              <Box mt={4} mb={4}>
                <Text fontWeight={600} fontSize={15}>
                  Community Type
                </Text>
                <Stack spacing={2}>
                  <Checkbox
                    name="public"
                    isChecked={communityType === "public"}
                    onChange={handleCheckChange}
                  >
                    <Flex align={"center"}>
                      <Icon as={BsFillEyeFill} mr={2} color="gray.500" />
                      <Text fontSize="10pt" mr={1}>
                        Public
                      </Text>
                      <Text fontSize="8pt" color="gray.500" pt={1}>
                        Anyone can view, post, and comment to this community
                      </Text>
                    </Flex>
                  </Checkbox>
                  <Flex>
                    <Checkbox
                      name="restricted"
                      isChecked={communityType === "restricted"}
                      onChange={handleCheckChange}
                    >
                      <Flex align={"center"}>
                        <Icon as={BsFillPersonFill} mr={2} color="gray.500" />
                        <Text fontSize="10pt" mr={1}>
                          Restricted
                        </Text>
                        <Text fontSize="8pt" color="gray.500" pt={1}>
                          Anyone can view this community but only approved users
                          can post
                        </Text>
                      </Flex>
                    </Checkbox>
                  </Flex>

                  <Checkbox
                    name="private"
                    isChecked={communityType === "private"}
                    onChange={handleCheckChange}
                  >
                    <Flex align={"center"}>
                      <Icon as={HiLockClosed} mr={2} color="gray.500" />
                      <Text fontSize="10pt" mr={1}>
                        Private
                      </Text>
                      <Text fontSize="8pt" color="gray.500" pt={1}>
                        Only approved users can view and sumbit to this
                        community
                      </Text>
                    </Flex>
                  </Checkbox>
                </Stack>
              </Box>
            </ModalBody>
          </Box>
          <ModalFooter bg="gray.100" borderRadius="0px 0px 10px 10px">
            <Button
              variant="outline"
              height="30px"
              mr={3}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              height="30px"
              onClick={handleCreateCommunity}
              isLoading={loading}
            >
              Create community
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default CreateCommunityModal;
