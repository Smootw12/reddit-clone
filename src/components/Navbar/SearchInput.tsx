import React, { useEffect } from "react";
import { Flex, Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { User } from "firebase/auth";

type SearchInputProps = {
  user?: User | null;
};

const SearchInput: React.FC<SearchInputProps> = ({ user }) => {
  return (
    <Flex
      flexGrow={1}
      mx={2}
      align={"center"}
      maxWidth={user ? "auto" : "680px"}
    >
      <InputGroup>
        <InputLeftElement
          pointerEvents="none"
          children={<SearchIcon color="gray.500" />}
        />
        <Input
          background={"gray.100"}
          borderRadius={"full"}
          type="tel"
          placeholder="Search Reddit"
          fontSize="10pt"
          _placeholder={{ color: "gray.800" }}
          _hover={{
            border: "1px solid",
            bg: "white",
            borderColor: "blue.500",
          }}
          _focus={{
            outline: "none",
            border: "1px solid",
            borderColor: "blue.500",
          }}
        />
      </InputGroup>
    </Flex>
  );
};
export default SearchInput;
