import { Box, Button, Flex, Icon, Image, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { Community } from "../../atoms/communityAtom";
import { FaReddit } from "react-icons/fa";
import useCommunityData from "../../hooks/useCommunityData";

type Props = {
  communityData: Community;
};

function Header({ communityData }: Props) {
  const { communityStateValue, onJoinOrLeaveCommunity, loading } =
    useCommunityData();

  const isJoined = !!communityStateValue.mySnippets.find(
    (snippet) => snippet.communityId === communityData.id
  );
  return (
    <Flex direction="column" width="100%" height="146px">
      <Box height="50%" bg="blue.400" />
      <Flex flexGrow={1} bg="white" justify="center">
        <Flex width="95%" maxWidth="860px" position="relative">
          <Flex
            justify="center"
            align="center"
            width="70px"
            height="70px"
            pos="absolute"
            top={-4}
            borderRadius="full"
            bg="white"
          >
            {communityStateValue.currentCommunity?.imageURL ? (
              <Image
                src={communityStateValue.currentCommunity.imageURL}
                top={-4}
                w="63.5px"
                height="63.5px"
                zIndex={2}
                borderRadius="full"
                objectFit="cover"
              />
            ) : (
              <Icon
                as={FaReddit}
                fontSize={64}
                top={-4}
                zIndex={2}
                color="blue.500"
              />
            )}
          </Flex>

          <Flex padding="10px 16px">
            <Flex direction="column" mr={"10"} ml={"20"}>
              <Text fontWeight={800} fontSize="16pt">
                {communityData.id}
              </Text>
              <Text fontWeight={600} fontSize="10pt" color="gray.400">
                r/{communityData.id}
              </Text>
            </Flex>
            <Button
              variant={isJoined ? "outline" : "solid"}
              height="30px"
              pr={6}
              pl={6}
              onClick={() => onJoinOrLeaveCommunity(communityData, isJoined)}
              isLoading={loading}
            >
              {isJoined ? "Joined" : "Join"}
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}

export default Header;
