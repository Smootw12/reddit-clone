import { Box, Flex, Icon, Text } from "@chakra-ui/react";
import React from "react";
import { IconType } from "react-icons/lib";

type TabItemProps = {
  TabItem: {
    title: string;
    icon: IconType;
  };
  selected: boolean;
  setSelectedTab: () => void;
};

function TabItem({ TabItem, selected, setSelectedTab }: TabItemProps) {
  return (
    <Flex
      justify="center"
      p="14px 0px"
      flexGrow={1}
      align="center"
      cursor="pointer"
      fontWeight={700}
      _hover={{ bg: "gray.50" }}
      color={selected ? "blue.500" : "gray.500"}
      borderWidth={selected ? "0px 1px 2px 0px" : "0px 1px 1px 0px"}
      borderBottomColor={selected ? "blue.500" : "gray.200"}
      borderRightColor="gray.200"
      onClick={setSelectedTab}
    >
      <Flex align="center" height="20px" mr={2}>
        <Icon as={TabItem.icon}></Icon>
      </Flex>
      <Text fontSize="10pt">{TabItem.title}</Text>
    </Flex>
  );
}

export default TabItem;
